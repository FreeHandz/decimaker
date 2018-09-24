import {DeciderLogic} from './decider-logic';
import {Choice} from './choice';
import {sortedIndexBy} from 'lodash-es';

export interface NodeInfo<TAction, TState>
{
    children: NodeInfo<TAction, TState>[];
    time: number;
    score: number;
    state: TState|null;
    action: TAction|null;
}

export class DebugDecider<TAction, TState>
{
    public lastNodeInfo: NodeInfo<TAction, TState>|null = null;
    
    public constructor(
        private readonly logic: DeciderLogic<TAction, TState>,
        private readonly maxDepth: number = Number.POSITIVE_INFINITY,
        private readonly storeStates: boolean = false
    )
    {

    }

    public getBestAction(state: TState): TAction|null
    {
        const children: NodeInfo<TAction, TState>[] = [];
        const startTime = performance.now();
        const [score,action] = this.exploreState(state, 0, children);
        const endTime = performance.now();
        
        this.lastNodeInfo = {
            children,
            time: endTime - startTime,
            score,
            state: this.storeStates ? state : null,
            action
        };
        
        return action;
    }

    private exploreState(state: TState, depth: number, children: NodeInfo<TAction, TState>[]): [number, TAction|null]
    {
        let availableActions: Iterable<TAction> = depth <= this.maxDepth ? this.logic.getActions(state) : [];
        const actionEvaluator = this.logic.getBestActionEvaluator();
        actionEvaluator.next(); // Initialize generator
        
        for (let action of availableActions)
        {
            const nextChildren: NodeInfo<TAction, TState>[] = [];
            let nextState = this.logic.applyAction(action, state);
            const startTime = performance.now(); 
            let [score, chosenAction] = this.exploreState(nextState, depth + 1, nextChildren);
            const endTime = performance.now();
            
            const nodeInfo = {
                children: nextChildren,
                time: endTime - startTime,
                score,
                state: this.storeStates ? nextState : null,
                action: chosenAction
            }; 
            
            const insertIndex = sortedIndexBy(children, nodeInfo, ni => ni.score);
            children.splice(insertIndex, 0, nodeInfo);

            actionEvaluator.next({
                score,
                action,
                state,
                nextState
            } as Choice<TAction, TState>);
        }
        
        // Get the final value from the action evaluator. If none is available, then handle this state as terminal and
        // calculate it's score. In the latter case return a null action.
        return actionEvaluator.next().value || [this.logic.evaluateState(state), null];
    }
}