import {Dummy} from './dummy';

test('outputs hello there', () => {
    const dummy = new Dummy();
    
    expect(dummy.doyourthing()).toBe('hello there');
});