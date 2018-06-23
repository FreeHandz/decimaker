import {Decider, DeciderLogic} from "./decider";
import {cloneDeep, countBy} from 'lodash';

interface AmoebaState
{
    board: string[][];
    player: string;
}

interface AmoebaAction
{
    symbol: string;
    coordinates: {
        x: number;
        y: number;
    };
}

const logic = {
    applyAction(action: AmoebaAction, state: AmoebaState): AmoebaState
    {
        let clonedState = cloneDeep(state);
        clonedState.board[action.coordinates.y][action.coordinates.x] = action.symbol;

        if (clonedState.player === 'x')
            clonedState.player = 'o';
        else
            clonedState.player = 'x';

        return clonedState;
    },
    getPointsForDirection(state: AmoebaState, x: number, y: number, dx: number, dy: number, player: string): number
    {
        let currentPlayer = 0;
        let oppositePlayer = 0;

        for (let i = 0; i < 3; i++)
        {
            if (state.board[y][x] === player)
                currentPlayer += 1;
            else if (state.board[y][x] !== '')
                oppositePlayer += 1;

            x += dx;
            y += dy;
        }

        if (currentPlayer === 3)
            return Number.POSITIVE_INFINITY;

        if (currentPlayer === 2 && oppositePlayer === 0)
            return 2;
        
        if (currentPlayer === 1 && oppositePlayer === 0)
            return 1;

        if (oppositePlayer === 3)
            return Number.NEGATIVE_INFINITY;

        if (oppositePlayer === 2 && currentPlayer === 0)
            return -2;
        
        if (oppositePlayer === 1 && currentPlayer === 0)
            return -1;

        return 0;
    },
    evaluateState(state: AmoebaState, player: string): number
    {
        let points = 0;

        for (let y = 0; y < 3; y++)
            points += this.getPointsForDirection(state, 0, y, 1, 0, player);

        for (let x = 0; x < 3; x++)
            points += this.getPointsForDirection(state, x, 0, 0, 1, player);

        points += this.getPointsForDirection(state, 0, 0, 1, 1, player);
        points += this.getPointsForDirection(state, 0, 2, 1, -1, player);

        return points;
    },
    *getActions(state: AmoebaState): Iterable<AmoebaAction>
    {
        for (let y = 0; y < state.board.length; y++)
        {
            for (let x = 0; x < state.board[y].length; x++)
            {
                if (state.board[y][x] === '')
                    yield { symbol: state.player, coordinates: { x, y } };
            }
        }
    },
    isTerminal(state: AmoebaState): boolean
    {
        let hasEmptySpace = false;

        for (let y = 0; y < state.board.length; y++)
        {
            for (let x = 0; x < state.board[y].length; x++)
            {
                if (state.board[y][x] === '')
                    hasEmptySpace = true;
            }
        }
        return this.evaluateState(state, state.player) === Number.POSITIVE_INFINITY
            || this.evaluateState(state, state.player) === Number.NEGATIVE_INFINITY || !hasEmptySpace;
    },
    *getBestActionEvaluator(): Generator
    {
        let firstValue = true;
        let bestAction: AmoebaAction | null = null;
        let bestScore: number = Number.NEGATIVE_INFINITY;

        let currentChoice: [number, AmoebaAction, boolean, string];
        while (currentChoice = yield)
        {
            let [score, action, isTerminal, actingPlayer] = currentChoice;
            
            if (action.symbol !== actingPlayer)
                score *= -1;
            
            if (firstValue || bestScore < score)
            {
                bestScore = score;
                bestAction = action;
                firstValue = false;
            }
        }
        
        return [bestScore, bestAction];
    }
};

test('simpleAmoeba', () => {

    const decider = new Decider<AmoebaAction, AmoebaState, string>(logic as DeciderLogic<AmoebaAction, AmoebaState, string>);

    const bestAction = decider.getBestAction({
        board: [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ],
        player: 'o'
    });

    expect(bestAction).toEqual({ symbol: 'o', coordinates: { x: 0, y: 0 } });
});

test('simpleAmoeba2', () => {

    const decider = new Decider<AmoebaAction, AmoebaState, string>(logic as DeciderLogic<AmoebaAction, AmoebaState, string>);

    const bestAction = decider.getBestAction({
        board: [
            ['o', 'o', ''],
            ['x', 'x', ''],
            ['', '', '']
        ],
        player: 'o'
    });

    expect(bestAction).toEqual({ symbol: 'o', coordinates: { x: 2, y: 0 } });
});

test('simpleAmoeba3', () => {

    const decider = new Decider<AmoebaAction, AmoebaState, string>(logic as DeciderLogic<AmoebaAction, AmoebaState, string>);

    const bestAction = decider.getBestAction({
        board: [
            ['o', '', ''],
            ['x', 'o', ''],
            ['x', 'x', '']
        ],
        player: 'o'
    });

    expect(bestAction).toEqual({ symbol: 'o', coordinates: { x: 2, y: 2 } });
});