export interface Choice<TAction, TState>
{
    score: number;
    action: TAction;
    state: TState;
    nextState: TState;
}