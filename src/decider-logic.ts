export interface DeciderLogic<TAction, TState>
{
    getActions(state: TState): Iterable<TAction>;

    applyAction(action: TAction, state: TState): TState;

    evaluateState(state: TState): number;

    getBestActionEvaluator(): Iterator<[number, TAction|null] | undefined>;
}