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
    
    getBestActionEvaluator(): Generator;
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
        const actionEvaluator = this.logic.getBestActionEvaluator();

        for (let action of availableActions)
        {
            let nextState = this.logic.applyAction(action, state);
            let score: number;

            if (this.logic.isTerminal(nextState))
            {
                score = this.logic.evaluateState(nextState, state.player);
            }
            else
            {
                [score] = this.exploreState(nextState);
            }
            
            actionEvaluator.next([score, action]);
        }
        
        const {done, value} = actionEvaluator.next();
        
        if (!done)
            throw new Error(`Best action evaluator did not end when asked`);

        return value;
    }
}