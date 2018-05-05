import React from 'react'
import style from './timeline.module.css'
import FixedColumnSection from './fixed-column'
import {DefaultTimeCell, DefaultRowCell} from './content'
import moment from 'moment'

class TimeLineSectionHeaderRow extends React.Component {
  render() {
    const start = this.props.timeline.start;
    const collapse = this.props.collapse;
    const scale = this.props.timeline.scale;  // microseconds per pixel
    const headerGroup = calcSizePos(start, this.props.timeline.headerGroup, collapse, scale);

    const interval = 15 * 60 * 1000;          // add title every 15 minutes

    // add headers
    const header_items = [...Array(100).keys()].map(i =>{
      return {time: start + interval * i, duration: interval}
    });
    calcSizePos(start, header_items, collapse, scale);

    // const headerGroup = [{title: 'today', time: moment() / 86400000, duration: 86400*1000}];
    const h2 = headerGroup.filter(item => item.width > 0).map(item => {
      const cellStyle = {
        left: item.left,
        width: item.width - 1,
        height: 24,
        borderBottom: '1px #000 solid',
        top: 0,
      };
      return <div key={item.title} className={style.headerCell} style={cellStyle}>{item.title}</div>
    });
    const header = header_items.filter(time => time.width > 0).map(time => {
      const cellStyle = {
        left: time.left,
        width: time.width - 1,  // 30 min * 60 sec * 1000 ms
        height: 25,
      };
      return <div key={time.left} className={style.headerCell} style={cellStyle}>{moment(time.time).format('HH:mm')}</div>
    });
    return <div className={style.headerRow}>{h2}{header}</div>
  }
}


class TimeLineSectionRow extends React.Component {
  render() {
    const item_times = this.props.times;
    const Cell = this.props.timeline.timecell;
    const elements = item_times.filter(time => time.width > 0).map(data => {
      const time = data.time;
      const cellStyle = {
        left: data.left,
        width: data.width - 1,
        height: this.props.height,
      };
      return <div key={time} className={style.cell} style={cellStyle}><Cell data={data}/></div>
    });
    return <div className={style.row}>{elements}</div>
  }
}

TimeLineSectionRow.defaultProps = {
  height: 50
};

class TimeLineSection extends React.Component {
  render() {
    const start = this.props.timeline.start;
    const items = this.props.timeline.items;
    const collapse = this.props.collapse;
    const scale = this.props.timeline.scale;

    // add header for section
    const header = <TimeLineSectionHeaderRow height={25} timeline={this.props.timeline} collapse={collapse} />;

    // add rows with elements
    const rows = items.map(data => {
      const times = calcSizePos(start, data.times, collapse, scale);
      return <TimeLineSectionRow key={data.id} timeline={this.props.timeline} times={times}/>
    });

    // collapse blocks with title
    const side_size = items.length * 50 + 25 + 3;
    const wraps = collapse.map(item => {
      const width = item.collapseWidth;

      return <div key={item.left} className={style.timeWrap} style={{left: item.left + 1, width: width - 1, height: side_size}}>
        <div style={{height: side_size, width: side_size}}>{moment(item.time).format('HH:mm')} - {moment(item.time + item.duration).format('HH:mm')}</div>
      </div>
    });

    return <div className={style.timeline} style={{backgroundSize: ~~(15*60*1000/scale)}}>
      {header}
      {rows}
      {wraps}
    </div>
  }
}

function findIndexReverse(arr, cb) {
  for(let i=arr.length - 1; i>=0; i--) {
    if(cb(arr[i])) return i;
  }
  return -1
}

function calcSizePos(start, items, collapses, scale) {
  for(let cell of items) {
    let startCollapsedTime = 0;
    let durationCollapsedTime = 0;
    let startIndex = findIndexReverse(collapses, c =>  cell.time >= c.time);
    let endIndex = collapses.findIndex(c => cell.time + cell.duration <= c.time + c.duration);

    if(startIndex !== -1 && collapses[startIndex].time + collapses[startIndex].duration > cell.time) {
      const leftOffset = collapses[startIndex].time + collapses[startIndex].duration - cell.time;
      startCollapsedTime -= leftOffset;
      durationCollapsedTime += leftOffset;
    }

    if(endIndex !== -1 && cell.time + cell.duration > collapses[endIndex].time) {
      durationCollapsedTime += cell.time + cell.duration - collapses[endIndex].time;
    }

    if(startIndex === -1 && start > cell.time) {
      // no collapses on left
      const leftOffset = start - cell.time;
      startCollapsedTime -= leftOffset;
      durationCollapsedTime += leftOffset;
    }

    if(startIndex > -1) {
      startCollapsedTime += collapses.slice(0, startIndex + 1).reduce((acc, cv) => acc + cv.duration, 0);
    }

    // altering endIndex to set it to upper bound of array
    if(endIndex === -1) endIndex = collapses.length;
    if(endIndex > startIndex + 1) {
      durationCollapsedTime += collapses.slice(startIndex + 1, endIndex).reduce((acc, cv) => acc + cv.duration, 0);
   }

    if(endIndex === startIndex) {
      cell.left = 0;
      cell.width = 0;
    } else {
      cell.left = ~~((cell.time - start - startCollapsedTime) / scale) + (startIndex + 1) * 20;
      cell.width = ~~((cell.duration - durationCollapsedTime) / scale) + (endIndex - startIndex - 1) * 20;
    }
  }
  return items
}

function calcCollapse(start, items, scale) {
  // flatten all times from all items
  const times = items.map(item =>
    item.times.map(e => {
      return {start: e.time, end: e.time + e.duration}
    })
  ).reduce((acc, value) => acc.concat(value), []);
  times.sort((left, right) => left.time - right.time);

  // finding time ranges
  let ranges = [];
  for(const higher of times) {
    if(ranges.length === 0) { ranges.push(higher); }
    else {
      const lower = ranges[ranges.length - 1];
      if(higher.start <= lower.end) {
        const upper_bound = Math.max(lower.end, higher.end);
        ranges[ranges.length - 1] = {start: lower.start, end: upper_bound}
      } else {
        ranges.push(higher);
      }
    }
  }

  // inverting ranges to free time
  const free = [...Array((ranges.length === 0)?0:ranges.length - 1).keys()].map(index => {
    const collapseTime = ranges[index+1].start - ranges[index].end;
    return {
      time: ranges[index].end,
      endTime: ranges[index].end + collapseTime,
      duration: collapseTime,
      collapseWidth: 20,
    }
  }).reduce((acc, next) => {
    /* filter out intervals less than 15 minutes */
    if(next.duration >= 15 * 60 * 1000) {
      const extra = acc.reduce((total, val) => total + val.duration, 0);
      next.left = ~~((next.time - start - extra) / scale) + 20 * acc.length;
      acc.push(next);
    }
    return acc
  }, []);

  return free
}

class Timeline extends React.Component {
  render() {
    const collapse = calcCollapse(this.props.start, this.props.items, this.props.scale);

    return <div style={{height: 27 + 51 * this.props.items.length, position: 'relative'}}>
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
  rowcell: DefaultRowCell,
  timecell: DefaultTimeCell,
  headerGroup: [],
};

export { Timeline, calcSizePos }
