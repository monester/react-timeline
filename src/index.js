/* eslint-disable */
import React from 'react'
import style from './timeline.module.css'
import moment from 'moment'


class DefaultRowCell extends React.Component {
  render() {
    return <div>{this.props.data.title}</div>
  }
}

class DefaultTimeCell extends React.Component {
  render() {
    return <div>{this.props.data.time.format('HH:mm')}</div>
  }
}

class TimeLineSectionHeaderRow extends React.Component {
  render() {
    const scale = this.props.timeline.scale;  // microseconds per pixel
    const interval = 15 * 60 * 1000;          // add title every 15 minutes
    const start = this.props.timeline.start;

    // round to 15 minutes
    const section_start = start - start % 900000;

    // add headers
    const header_items = Array.from({length: 30}, (_, i) =>{
      return {time: start + interval * i, duration: interval}
    });
    console.log('>> start')
    precalcSizeGen(start, header_items, this.props.collapse, scale);
    console.log('>> end')

    const header = header_items.filter(time => time.width > 0).map(time => {
      const cellStyle = {
        left: time.left,
        width: time.width,  // 30 min * 60 sec * 1000 ms
        height: 25,
      };
      return <div key={time.left} className={style.headerCell} style={cellStyle}>{moment(time.time).format('HH:mm')}</div>
    });
    return <div className={style.headerRow}>{header}</div>
  }
}


class TimeLineSectionRow extends React.Component {
  render() {
    const item_times = this.props.times;
    const scale = this.props.timeline.scale;
    const start = this.props.timeline.start;
    const Cell = this.props.timeline.timecell;

    const elements = item_times.map(data => {
      const time = data.time;
      const duration = data.duration;
      const cellStyle = {
        left: data.left,
        width: data.width,
        height: this.props.height,
      };
      return <div key={time} className={style.cell} style={cellStyle}><Cell data={data}/></div>
    });
    // const lines = _.range(0, 360, 30).map(offset => <Line key={"line"+offset} left={offset*4 + "px"} />);
    return <div className={style.row}>{elements}</div>
  }
}

TimeLineSectionRow.defaultProps = {
  height: 50
};

class TimeLineSection extends React.Component {
  render() {
    const tl = this.props.timeline;
    const items = precalcSize(tl.start, tl.items, this.props.ranges, tl.scale);
    // const ranges = precalcSize(tl.start, [{times: this.props.ranges}], [], tl.scale)[0].times;
    const ranges = this.props.ranges;


    // add header for section
    const header = <TimeLineSectionHeaderRow height={25} timeline={this.props.timeline} collapse={ranges} />;

    // add rows with elements
    const rows = items.map(data =>
      <TimeLineSectionRow key={data.id} timeline={this.props.timeline} times={data.times}/>
    );

    const wraps = ranges.map(item =>
      <div key={item.left} className={style.timeWrap} style={{left: item.left, width: item.collapseWidth}} />
    )
    // const wraps = <div className={style.timeWrap} />;
    return <div className={style.timeline} style={{backgroundSize: ~~(15*60*1000/tl.scale)}}>
      {header}
      {rows}
      {wraps}
    </div>
  }
}

class FixedColumnSection extends React.Component {
  render() {
    const Cell = this.props.timeline.rowcell;
    const items = this.props.timeline.items;

    const rows = items.map(item =>
      <div key={item.id} className={style.row}><Cell data={item}/></div>
    );
    return <div className={style.fixedColumn}>
      <div className={style.headerRow} />
      {rows}
    </div>
  }
}

function precalcSizeGen(start, items, collapse, scale) {
  let collapseIndex = 0;  // not active yet
  let collapsedTime = 0;
  let collapsedWidth = 0;
  let startTime = start;
  let endTime = (collapse.length > 0)?collapse[0].time:Infinity;
  for(let cell of items) {
    if(cell.time >= endTime && collapseIndex < collapse.length) {
      // console.log(collapse[collapseIndex].time + collapse[collapseIndex].duration)
      startTime = collapse[collapseIndex].time + collapse[collapseIndex].duration;
      collapsedTime += collapse[collapseIndex].duration;
      collapsedWidth += 20;
      collapseIndex += 1;
      endTime = (collapse.length > collapseIndex)?collapse[collapseIndex].time:Infinity;
    }

    // console.log(new Date(cell.time), new Date(startTime));
    console.log(`collapsedWidth: ${collapsedWidth}`);
    if(cell.time < startTime) {
      cell.left = 0;
      cell.width = 0;
    } else {
      cell.left = ~~((cell.time - start - collapsedTime) / scale) + collapsedWidth;
      cell.width = ~~(cell.duration / scale);
    }
  }
  return items
}


function precalcSize(start, items, collapse, scale) {
  const allCells = []
  for(let item of items) {
    for(let cell of item.times) {
      allCells.push(cell);
    }
  }
  allCells.sort((a, b) => a.start - b.start);
  precalcSizeGen(start, allCells, collapse, scale);
  return items;
}

function calcCollapse(start, items, scale) {
    // flatten all times from all rows
    const allTimes = items.map(item =>
      item.times.map(e => {
        return {start: e.time, end: e.time + e.duration}
      })
    ).reduce((acc, value) => acc.concat(value), []);
    allTimes.sort((a, b) => a.start - b.start);

    // finding time ranges
    let ranges = [];
    for(const higher of allTimes) {
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
    let collapsedTime = 0;
    let collapsedWidth = 0;
    const free = ranges.slice(1).map((_, index) => {
      const left = ~~((ranges[index].end - start - collapsedTime) / scale) + collapsedWidth;
      const collapseTime = ranges[index+1].start - ranges[index].end;
      collapsedWidth += 20;
      collapsedTime += collapseTime;
      return {
        time: ranges[index].end,
        left: left,
        duration: collapseTime,
        collapseWidth: 20,
      }
    });
    return free
}

class Timeline extends React.Component {
  render() {
    console.log("RENDER")
    console.log(this.props.start)
    if (this.props.items.length > 0)
      console.log(this.props.items[0].times[0].time);
    console.log("RENDER STOP")

    const ranges = calcCollapse(this.props.start, this.props.items, this.props.scale);
    return <div style={{height: 27 + 51 * this.props.items.length}}>
      <FixedColumnSection timeline={this.props} />
      <TimeLineSection timeline={this.props} ranges={ranges} />
    </div>
  }
}

Timeline.defaultProps = {
  start: moment(),
  scale: 15000,
  roundTo: 30 * 60 * 1000, // 30 minutes in ms
  items: [],
  rowcell: DefaultRowCell,
  timecell: DefaultTimeCell,
};

export { Timeline }
