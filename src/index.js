import React from 'react'
import './timeline.css'
import moment from 'moment';


// class Line extends React.Component {
//   render() {
//     const style = {
//       left: this.props.left,
//       position: 'absolute',
//       width: 1,
//       height: 50,
//       borderLeft: '1px #000 solid',
//       opacity: '0.2',
//       marginLeft: '-1px',
//     };
//     return <div style={style} />
//   }
// }

class DefaultRowCell extends React.Component {
  render() {
    return <div>{this.props.time.format('HH:mm')}</div>
  }
}

class DefaultTimeCell extends React.Component {
  render() {
    return <div>{this.props.time.format('HH:mm')}</div>
  }
}

class TimeLineSectionHeaderRow extends React.Component {
  render() {
    const scale = this.props.timeline.scale;  // microseconds per pixel
    const interval = 30;  // add title every 30 minutes
    const start = this.props.timeline.start;
    const row_count = this.props.timeline.items.length;


    // round to 15 minutes
    const section_start = moment(start - start % 900000);

    // add headers
    const header_items = Array.from({length: 20}, (_, i) =>
      section_start.clone().add({minutes: i * interval}),
    );

    const header = header_items.map(time => {
      const style = {
        left: ~~((time - start) / scale),
        width: interval * 60000 / scale,  // 30 min * 60 sec * 1000 ms
        height: 25,
        position: 'absolute',
        display: 'block',
        borderLeft: '1px #000 solid',
        marginLeft: '-1px',
        backgroundColor: 'red',
        marginBottom: 50 * row_count,
        zIndex: 100,
      };
      return <div key={time} style={style}>{time.format('HH:mm')}</div>
    });

    return <div className="header">{header}</div>
  }
}


class TimeLineSectionRow extends React.Component {
  render() {
    const item_times = this.props.times;
    const scale = this.props.timeline.scale;
    const start = this.props.timeline.start;
    const Cell = this.props.timeline.timecell;

    const elements = item_times.map(data => {
      const left = data.start_time;
      const right = data.end_time;
      const style = {
        left: ~~((left - start) / scale),
        width: ~~((right - left) / scale),
        height: this.props.height,
        position: 'absolute',
        display: 'block',
        borderLeft: '1px #000 solid',
        marginLeft: '-1px',
        backgroundColor: 'red',
        overflow: 'hidden',
      };
      return <div key={left} style={style}><Cell time={left} data={data}/></div>
    });
    // const lines = _.range(0, 360, 30).map(offset => <Line key={"line"+offset} left={offset*4 + "px"} />);
    return <div className="row">{elements}</div>
  }
}

TimeLineSectionRow.defaultProps = {
  height: 50
};

class TimeLineSection extends React.Component {
  render() {
    const items = this.props.timeline.items;

    // add header for section
    const header = <TimeLineSectionHeaderRow height={25} timeline={this.props.timeline} />;

    // add rows with elements
    const rows = items.map(data =>
      <TimeLineSectionRow key={data.id} timeline={this.props.timeline} times={data.times}/>
    );
    return <div className='time-line'>
      {header}
      {rows}
    </div>
  }
}

class FixedColumnSection extends React.Component {
  render() {
    const Cell = this.props.timeline.rowcell;
    const items = this.props.timeline.items;

    const rows = items.map(item =>
      <div key={item.id} className='row'><Cell data={item}/></div>
    );
    return <div className='fixed'>
      <div className='header' />
      {rows}
    </div>
  }
}


class Timeline extends React.Component {
  render() {
    return <div style={{position: 'relative'}}>
      <FixedColumnSection timeline={this.props} />
      <TimeLineSection timeline={this.props} />
    </div>
  }
}

Timeline.defaultProps = {
  start: moment(),
  scale: 15000,
  items: [],
  rowcell: DefaultRowCell,
  timecell: DefaultTimeCell,
};

export { Timeline }
