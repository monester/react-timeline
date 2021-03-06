import React from 'react'
import style from './timeline.module.css'
import FixedColumnSection from './fixed-column'
import { DefaultTimeCell, DefaultRowCell } from './content'
import moment from 'moment'

class TimeLineSectionHeaderGroupRow extends React.Component {
  render () {
    const item = this.props.item
    const sideSize = this.props.sideSize

    return <div key={item.left} className={style.timeWrap} style={{left: item.left + 20, width: sideSize}}>
      <div style={{height: 20, width: sideSize}}>{moment.duration(item.duration).humanize()}</div>
    </div>
  }
}

class TimeLineSectionHeaderRow extends React.Component {
  render () {
    const start = this.props.timeline.start
    const collapse = this.props.collapse
    const scale = this.props.timeline.scale // microseconds per pixel
    const headerGroup = calcSizePos(start, this.props.timeline.headerGroup, collapse, scale)

    const interval = 15 * 60 * 1000 // add title every 15 minutes

    // add headers
    const headerItems = [...Array(100).keys()].map(i => {
      return {time: start + interval * i, duration: interval}
    })
    calcSizePos(start, headerItems, collapse, scale)

    const h2 = headerGroup.filter(item => item.width > 0).map(item =>
      <div
        key={item.title}
        className={style.headerGroupCell}
        style={{left: item.left, width: item.width}}>{item.title}</div>
    )

    const header = headerItems.filter(time => time.width > 0).map(time =>
      <div
        key={time.left} className={style.headerCell}
        style={{left: time.left, width: time.width + 1}}>{moment(time.time).format('HH:mm')}</div>
    )

    return <div className={style.row} style={{height: 51}}>{h2}{header}</div>
  }
}

class TimeLineSectionRow extends React.Component {
  render () {
    const height = this.props.timeline.rowHeight
    const item = this.props.item
    const Cell = this.props.timeline.timeCell
    const elements = item.times.filter(time => time.width > 0).map(data =>
      <div
        key={data.time} className={style.cell}
        style={{left: data.left, width: data.width + 1}}><Cell item={item} data={data} /></div>
    )
    return <div className={style.row} style={{height: height}}>{elements}</div>
  }
}

class TimeLineSection extends React.Component {
  render () {
    const start = this.props.timeline.start
    const items = this.props.timeline.items
    const height = this.props.timeline.rowHeight - 1
    const fixedWidth = this.props.timeline.fixedWidth
    const collapse = this.props.collapse
    const scale = this.props.timeline.scale

    // add header for section
    const header = <TimeLineSectionHeaderRow height={25} timeline={this.props.timeline} collapse={collapse} />

    // add rows with elements
    const rows = items.map(item => {
      const times = calcSizePos(start, item.times, collapse, scale)
      return <TimeLineSectionRow key={item.id} timeline={this.props.timeline} item={item} times={times}/>
    })

    // collapse blocks with title
    const wraps = collapse.map(item =>
      <TimeLineSectionHeaderGroupRow
        key={item.time} item={item} width={item.collapseWidth}
        sideSize={items.length * height + 25} />
    )

    const extraStyle = {
      width: `calc(100% - ${fixedWidth}px)`,
      left: fixedWidth,
    }

    return <div className={style.timeline} style={extraStyle}>
      {wraps}
      <div>{header}{rows}</div>
    </div>
  }
}

function findIndexReverse (arr, cb) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (cb(arr[i])) return i
  }
  return -1
}

function calcSizePos (start, items, collapses, scale) {
  for (let cell of items) {
    let startCollapsedTime = 0
    let durationCollapsedTime = 0
    let startIndex = findIndexReverse(collapses, c => cell.time >= c.time)
    let endIndex = collapses.findIndex(c => cell.time + cell.duration <= c.time + c.duration)

    if (startIndex !== -1 && collapses[startIndex].time + collapses[startIndex].duration > cell.time) {
      const leftOffset = collapses[startIndex].time + collapses[startIndex].duration - cell.time
      startCollapsedTime -= leftOffset
      durationCollapsedTime += leftOffset
    }

    if (endIndex !== -1 && cell.time + cell.duration > collapses[endIndex].time) {
      durationCollapsedTime += cell.time + cell.duration - collapses[endIndex].time
    }

    if (startIndex === -1 && start > cell.time) {
      // no collapses on left
      const leftOffset = start - cell.time
      startCollapsedTime -= leftOffset
      durationCollapsedTime += leftOffset
    }

    if (startIndex > -1) {
      startCollapsedTime += collapses.slice(0, startIndex + 1).reduce((acc, cv) => acc + cv.duration, 0)
    }

    // altering endIndex to set it to upper bound of array
    if (endIndex === -1) endIndex = collapses.length
    if (endIndex > startIndex + 1) {
      durationCollapsedTime += collapses.slice(startIndex + 1, endIndex).reduce((acc, cv) => acc + cv.duration, 0)
    }

    if (endIndex === startIndex) {
      cell.left = 0
      cell.width = 0
    } else {
      cell.left = ~~((cell.time - start - startCollapsedTime) / scale) + (startIndex + 1) * 20
      cell.width = ~~((cell.duration - durationCollapsedTime) / scale) + (endIndex - startIndex - 1) * 20
    }
  }
  return items
}

function calcCollapse (start, items, scale) {
  // flatten all times from all items
  const times = items.map(item =>
    item.times.map(e => {
      return {start: e.time / 1, end: e.time + e.duration}
    })
  ).reduce((acc, value) => acc.concat(value), [])
  times.sort((left, right) => left.start - right.start)

  // finding time ranges
  let ranges = []
  for (const higher of times) {
    if (ranges.length === 0) {
      ranges.push(higher)
    } else {
      const lower = ranges[ranges.length - 1]
      if (higher.start <= lower.end) {
        const upperBound = Math.max(lower.end, higher.end)
        ranges[ranges.length - 1] = {start: lower.start, end: upperBound}
      } else {
        ranges.push(higher)
      }
    }
  }

  // inverting ranges to free time
  return [...Array((ranges.length === 0) ? 0 : ranges.length - 1).keys()].map(index => {
    const collapseTime = ranges[index + 1].start - ranges[index].end
    return {
      time: ranges[index].end,
      endTime: ranges[index].end + collapseTime,
      duration: collapseTime,
      collapseWidth: 20
    }
  }).reduce((acc, next) => {
    /* filter out intervals less than 15 minutes */
    if (next.duration >= 15 * 60 * 1000) {
      const extra = acc.reduce((total, val) => total + val.duration, 0)
      next.left = ~~((next.time - start - extra) / scale) + 20 * acc.length
      acc.push(next)
    }
    return acc
  }, [])
}

class Timeline extends React.Component {
  render () {
    const collapse = calcCollapse(this.props.start, this.props.items, this.props.scale)
    const itemsCount = this.props.items.length
    const rowHeight = this.props.rowHeight
    return <div style={{height: 52 + rowHeight * itemsCount, position: 'relative'}}>
      <FixedColumnSection timeline={this.props} />
      <TimeLineSection timeline={this.props} collapse={collapse} />
    </div>
  }
}

Timeline.defaultProps = {
  start: moment(),
  scale: 10000,
  roundTo: 30 * 60 * 1000, // 30 minutes in ms
  items: [],
  rowCell: DefaultRowCell,
  rowHeight: 51,
  fixedWidth: 300,
  timeCell: DefaultTimeCell,
  headerGroup: []
}

export { Timeline, calcSizePos }
