/* eslint-disable */
import React from 'react'
import style from './timeline.module.css'
import FixedColumnSection from './fixed-column'
import {DefaultTimeCell, DefaultRowCell} from './content'
import moment from 'moment'

class TimeLineSectionHeaderRow extends React.Component {
  render() {
    const start = this.props.timeline.start;
    const items = this.props.timeline.items;
    const collapse = this.props.collapse;
    const scale = this.props.timeline.scale;  // microseconds per pixel

    const interval = 15 * 60 * 1000;          // add title every 15 minutes

    // add headers
    const header_items = [...Array(60).keys()].map(i =>{
      return {time: start + interval * i, duration: interval}
    });
    precalcSizeGen(start, header_items, collapse, scale);

    const headerGroup = [{title: 'today', time: moment() / 86400000, duration: 86400*1000}];
    const h2 = headerGroup.map(item => {
      const cellStyle = {
        left: 0,
        width: 1000,
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
    const elements = item_times.map(data => {
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
      const times = precalcSizeGen(start, data.times, collapse, scale);
      return <TimeLineSectionRow key={data.id} timeline={this.props.timeline} times={times}/>
    });

    const wraps = collapse.map(item => {
      const height = items.length * 50 + 25 + 3;
      const width = item.collapseWidth;

      return <div key={item.left} className={style.timeWrap}
           style={{left: item.left + 1, width: width - 1, height: height}}>
        <div style={{height: height, width: height}}>{moment(item.time).format('HH:mm')} - {moment(item.time + item.duration).format('HH:mm')}</div>
      </div>
    });
    return <div className={style.timeline} style={{backgroundSize: ~~(15*60*1000/scale)}}>
      {header}
      {rows}
      {wraps}
    </div>
  }
}

Array.prototype.findReverse = (cb) => {
  for(let i=this.length; i>0; i--) {
    if(cb(this[i])) return this[i];
  }
};

function precalcSizeGen(start, items, collapse, scale) {
  let collapseIndex = 0;
  // let collapsedTime = 0;
  // let collapsedWidth = 0;
  let startTime = start;
  let endTime = (collapse.length > 0)?collapse[0].time:Infinity;
  for(let cell of items) {
    while(cell.time >= endTime && collapseIndex < collapse.length) {
      startTime = collapse[collapseIndex].time + collapse[collapseIndex].duration;
      // collapsedTime += collapse[collapseIndex].duration;
      // collapsedWidth += 20;
      collapseIndex += 1;
      endTime = (collapse.length > collapseIndex)?collapse[collapseIndex].time:Infinity;
    }

    if(cell.time < startTime) {
      cell.left = 0;
      cell.width = 0;
    } else {
      const func = item => cell.time > item.time;
      const startCollapsedTimes = collapse.filter(func).map(i => i.duration);
      const startCollapsedTime = startCollapsedTimes.reduce((acc, cv) => acc + cv, 0);
      const startCollapsedWidth = startCollapsedTimes.length * 20;

      const endCollapsedTimes = collapse.filter(item => cell.time + cell.duration > item.time).map(i => i.duration);
      const endCollapsedTime = endCollapsedTimes.reduce((acc, cv) => acc + cv, 0);
      const endCollapsedWidth = endCollapsedTimes.length * 20;


      // const end = collapse.find(func) || Infinity; //.map(i => i.duration)
      const end = collapse.findReverse(item => cell.time + cell.duration <= item.time) || Infinity;
      const endTime = (end === Infinity)?Infinity:end.time;

      cell.left = ~~((cell.time - start - startCollapsedTime) / scale) + startCollapsedWidth;
      if (cell.time + cell.duration <= endTime) {
        cell.width = ~~((cell.duration - (endCollapsedTime - startCollapsedTime)) / scale) + (endCollapsedWidth - startCollapsedWidth);
      } else {
        cell.width = ~~((endTime - cell.time) / scale);
      }
    }
  }
  return items
}

function calcCollapse(start, items, scale) {
  const day = 86400000;
  const hrs8 = day / 3;
  const topItems = [
    {
      title: 'first',
      time: moment(~~(moment() / day) * day),
      duration: hrs8,
    }, {
      title: 'first',
      time: moment(~~(moment() / day) * day) + hrs8,
      duration: hrs8,
    }, {
      title: 'first',
      time: moment(~~(moment() / day) * day) + hrs8 * 2,
      duration: hrs8,
    }, {
      title: 'first',
      time: moment(~~(moment() / day) * day) + hrs8 * 3,
      duration: hrs8,
    }, {
      title: 'first',
      time: moment(~~(moment() / day) * day) + hrs8 * 4,
      duration: hrs8,
    }
  ];

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
    // console.log(collapse);
    const min30 = 30 * 60 * 1000;
    if (this.props.items.length > 0) {
      // console.log(this.props.items[1].times);
      this.props.items[1].times.push({
        time: moment(Math.ceil(moment() / min30) * min30 + min30),
        duration: min30 * 3, clan_a: null, clan_b: null,
      });
      this.props.items[1].times.sort((left, right) => left.time - right.time);
      // console.log(this.props.items[1].times);

    }
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
};

export { Timeline }
