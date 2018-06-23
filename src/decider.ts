export interface DeciderLogic<TAction, TState, TPlayer>
{
    getActions(state: TState): Iterable<TAction>;

    applyAction(action: TAction, state: TState): TState;

    evaluateState(nextState: TState, state: TState): number;

    isTerminal(state: TState): boolean;
    
    getBestActionEvaluator(): Iterator<[number, TAction]|undefined>;
}

export interface Choice<TAction, TState>
{
    score: number;
    action: TAction;
    state: TState;
    scoreState: TState;
}

export class Decider<TAction, TState, TPlayer>
{
    public constructor(private logic: DeciderLogic<TAction, TState, TPlayer>)
    {

    }

    public getBestAction(state: TState): TAction
    {
        return this.exploreState(state)[1];
    }

    private exploreState(state: TState): [number, TAction]
    {
        let availableActions: Iterable<TAction> = this.logic.getActions(state);
        const actionEvaluator = this.logic.getBestActionEvaluator();
        actionEvaluator.next(); // Initialize generator
        
        for (let action of availableActions)
        {
            let nextState = this.logic.applyAction(action, state);
            let score: number;
            let scoreState: TState;

            if (this.logic.isTerminal(nextState))
            {
                score = this.logic.evaluateState(nextState, state);
                scoreState = state;
            }
            else
            {
                [score] = this.exploreState(nextState);
                scoreState = nextState;
            }
            
            actionEvaluator.next({
                score,
                action,
                state,
                scoreState
            });
        }
        
        const {done, value} = actionEvaluator.next();
        
        if (!done)
            throw new Error(`Best action evaluator did not end when asked`);
        
        if (!value)
            throw new Error(`Best action evaluator did not return result`);

        return value;
    }
}