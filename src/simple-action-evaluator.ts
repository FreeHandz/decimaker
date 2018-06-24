import {Choice} from './decider';

export function *createSimpleActionEvaluator<TAction, TState, TPlayer>(playerSelector: (state: TState) => TPlayer)
    : Iterator<[number, TAction]|undefined>
{
    let firstValue = true;
    let bestAction: TAction | null = null;
    let bestScore: number = Number.NEGATIVE_INFINITY;

    let choice: Choice<TAction, TState>;
    while (choice = yield)
    {
        let score = choice.score;

        if (playerSelector(choice.state) !== playerSelector(choice.scoreState))
            score *= -1;

        if (firstValue || bestScore < score)
        {
            bestScore = score;
            bestAction = choice.action;
            firstValue = false;
        }
    }

    return [bestScore, bestAction];
}