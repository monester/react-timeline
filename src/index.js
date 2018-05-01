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
    const interval = 30;                      // add title every 30 minutes
    const start = this.props.timeline.start;
    const row_count = this.props.timeline.items.length;

    // round to 15 minutes
    const section_start = moment(start - start % 900000);

    // add headers
    const header_items = Array.from({length: 20}, (_, i) =>
      section_start.clone().add({minutes: i * interval}),
    );

    const header = header_items.map(time => {
      const cellStyle = {
        left: ~~((time - start) / scale),
        width: interval * 60000 / scale,  // 30 min * 60 sec * 1000 ms
        height: 25,
      };
      return <div key={time} className={style.cell} style={cellStyle}>{time.format('HH:mm')}</div>
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
    const items = precalcSize(tl.start, tl.items, [], tl.scale);
    const ranges = this.props.timeline.ranges;

    // add header for section
    const header = <TimeLineSectionHeaderRow height={25} timeline={this.props.timeline} />;

    // add rows with elements
    const rows = items.map(data =>
      <TimeLineSectionRow key={data.id} timeline={this.props.timeline} times={data.times}/>
    );

    // const wraps = ranges.map(item =>
    //   <div className={style.timeWrap} />
    // )
    const wraps = <div className={style.timeWrap} />;
    return <div className={style.timeline}>
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

// class DataSource {
//   constructor(start, items, collapse=[]) {
//     this.collapse = collapse;
//     this.items = [];
//     items.map(item => {
//       this.items.push()
//     })
//   }

//   generateItems(items) {
//     this.items = [];
// //    for

//   }

//   static calcOffset() {

//   }

//   rows() {

//   }
// }

function precalcSize(start, items, collapse, scale) {
  for(let item of items) {
    for(let cell of item.times) {
      cell.left = ~~((cell.time - start) / scale);
      cell.width = ~~(cell.duration / scale);
    }
  }
  console.log(items);
  return items;
}

class Timeline extends React.Component {
  constructor(props) {
    super(props);
  }

  getRanges = () => {
    const items = this.props.items;
    const roundTo = this.props.roundTo;
    let allTimes = [];
    for(const i of items) allTimes = allTimes.concat(i.times.map(e => {
      const startTime = e.time - e.time % roundTo;
      let endTime = e.time + e.duration;
      endTime = endTime - endTime % roundTo + roundTo;
      return {start: e.time - e.time % roundTo, end: endTime}
    }));
    allTimes.sort((a,b) => a.start-b.start);
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
    // console.log(allTimes);
    // console.log(ranges.map(x => `${new Date(x.start)}-${new Date(x.end)}`).join(','));
    return ranges
  };

  render() {
    const ranges = this.getRanges();
    return <div style={{height: 27 + 51*this.props.items.length}}>
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
