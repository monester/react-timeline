import { Timeline, calcSizePos } from './'

test('Test no collapse', () => {
  expect(calcSizePos(1, [{time: 1, duration: 1}], [], 1)).toEqual([
    {time: 1, duration: 1, left: 0, width: 1}
  ])
})

test('Test collapse between items', () => {
  const items = [{
    time: 1, duration: 1
  }, {
    time: 3, duration: 1
  }]
  const collapse = [{time: 2, duration: 1}]
  expect(calcSizePos(1, items, collapse, 1)).toEqual([
    {time: 1, duration: 1, left: 0, width: 1},
    {time: 3, duration: 1, left: 21, width: 1}
  ])
})

test('Test collapse hide item', () => {
  const items = [{
    time: 1, duration: 1
  }, {
    time: 2, duration: 1
  }, {
    time: 3, duration: 1
  }]
  const collapse = [{time: 2, duration: 1}]
  expect(calcSizePos(1, items, collapse, 1)).toEqual([
    {time: 1, duration: 1, left: 0, width: 1},
    {time: 2, duration: 1, left: 0, width: 0},
    {time: 3, duration: 1, left: 21, width: 1}
  ])
})

test('Test collapse left item', () => {
  const items = [{
    time: 1, duration: 2
  }, {
    time: 3, duration: 1
  }]
  const collapse = [{time: 2, duration: 1}]
  expect(calcSizePos(1, items, collapse, 1)).toEqual([
    {time: 1, duration: 2, left: 0, width: 1},
    {time: 3, duration: 1, left: 21, width: 1}
  ])
})

test('Test collapse inside item', () => {
  const items = [{
    time: 1, duration: 3
  }]
  const collapse = [{time: 2, duration: 1}]
  expect(calcSizePos(1, items, collapse, 1)).toEqual([
    {time: 1, duration: 3, left: 0, width: 22},
  ])
})

test('Test multiple collapse inside item', () => {
  const items = [{
    time: 1, duration: 5
  }]
  const collapse = [{time: 2, duration: 1}, {time: 4, duration: 1}]
  expect(calcSizePos(1, items, collapse, 1)).toEqual([
    {time: 1, duration: 5, left: 0, width: 43},
  ])
})

test('Test collapse right item', () => {
  const items = [{
    time: 1, duration: 1
  }, {
    time: 2, duration: 2
  }]
  const collapse = [{time: 2, duration: 1}]
  expect(calcSizePos(1, items, collapse, 1)).toEqual([
    {time: 1, duration: 1, left: 0, width: 1},
    {time: 2, duration: 2, left: 21, width: 1}
  ])
})
/* */
