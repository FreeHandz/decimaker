export interface HasPlayer<T>
{
    player: T;
}

export interface DeciderLogic<TAction, TState extends HasPlayer<TPlayer>, TPlayer>
{
    getActions(state: TState): Iterable<TAction>;

    applyAction(action: TAction, state: TState): TState;

    evaluateState(state: TState, player: TPlayer): number;

    isTerminal(state: TState): boolean;
}

export class Decider<TAction, TState extends HasPlayer<TPlayer>, TPlayer>
{
    public constructor(private logic: DeciderLogic<TAction, TState, TPlayer>)
    {

    }

    public getBestAction(state: TState): TAction
    {
        return this.exploreState(state)[1];
    }

    public exploreState(state: TState): [number, TAction]
    {
        let availableActions: Iterable<TAction> = this.logic.getActions(state);
        let firstValue = true;
        let bestAction: TAction | null = null;
        let bestScore: number = Number.NEGATIVE_INFINITY;

        for (let action of availableActions)
        {
            let nextState = this.logic.applyAction(action, state);

            if (this.logic.isTerminal(nextState))
            {
                let finalStatePoint = this.logic.evaluateState(nextState, state.player);

                if (firstValue || finalStatePoint < bestScore)
                {
                    bestScore = finalStatePoint;
                    bestAction = action;
                    firstValue = false;
                }
            }
            else
            {
                let [stateScore, action] = this.exploreState(nextState);
                if (firstValue || stateScore < bestScore)
                {
                    bestScore = stateScore;
                    bestAction = action;
                    firstValue = false;
                }
            }
        }

        return [bestScore, bestAction!];
    }
}