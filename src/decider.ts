import {DeciderLogic} from './decider-logic';
import {Choice} from './choice';

export class Decider<TAction, TState, TPlayer>
{
    public beforeExplore: (state: TState) => void = () => {};
    public afterExplore: (state: TState, score: number, action: TAction|null) => void = () => {};
    
    public constructor(private logic: DeciderLogic<TAction, TState>)
    {

    }

    public getBestAction(state: TState): TAction|null
    {
        const [,action] = this.exploreState(state);
        
        return action;
    }

    private exploreState(state: TState): [number, TAction|null]
    {
        let availableActions: Iterable<TAction> = this.logic.getActions(state);
        const actionEvaluator = this.logic.getBestActionEvaluator();
        actionEvaluator.next(); // Initialize generator

        this.beforeExplore(state);
        
        for (let action of availableActions)
        {
            let nextState = this.logic.applyAction(action, state);
            let [score] = this.exploreState(nextState);

            actionEvaluator.next({
                score,
                action,
                state,
                nextState
            } as Choice<TAction, TState>);
        }
        
        // Get the final value from the action evaluator. If none is available, then handle this state as terminal and
        // calculate it's score. In the latter case return a null action.
        const result = actionEvaluator.next().value || [this.logic.evaluateState(state), null];
        
        this.afterExplore(state, result[0], result[1]);
        
        return result;
    }
}