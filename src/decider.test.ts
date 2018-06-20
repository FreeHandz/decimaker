import {Decider, DeciderLogic} from "./decider";
import {cloneDeep, countBy} from 'lodash';

test('simpleAmoeba', () => {
    interface AmoebaState
    {
        board: string[][];
        player: string;
    }

    interface AmoebaAction
    {
        symbol: string;
        coordinate: {
            x: number;
            y: number;
        };
    }

    const logic = {
        applyAction(action: AmoebaAction, state: AmoebaState): AmoebaState
        {
            let clonedState = cloneDeep(state);
            clonedState.board[action.coordinate.y][action.coordinate.x] = action.symbol;

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
                return 1;

            if (oppositePlayer === 3)
                return Number.NEGATIVE_INFINITY;

            if (oppositePlayer === 2 && currentPlayer === 0)
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
                        yield { symbol: state.player, coordinate: { x, y } };
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
        }

    };

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