import React from 'react'
import './timeline.css'
import moment from 'moment';


class Line extends React.Component {
  render() {
    const style = {
      left: this.props.left,
      position: 'absolute',
      width: 1,
      height: 50,
      borderLeft: '1px #000 solid',
      opacity: '0.2',
      marginLeft: '-1px',
    };
    return <div style={style} />
  }
}

class TimeLineSectionHeaderRow extends React.Component {
  render() {
    const scale = this.props.timeline.scale;  // microseconds per pixel
    const start = this.props.timeline.start;
    const row_count = this.props.timeline.items.length;

    // round to 15 minutes
    const section_start = moment(start - start % 900000);

    const range = Array.from({length: 20}, (_, i) => i);

    // add headers
    const header_items = range.map(time => [
      section_start.clone().add({minutes: time * 30}),
      section_start.clone().add({minutes: time * 30 + 30})
    ]);
    // console.log(header_items);

    const header = header_items.map(time => {
      const left = time[0];
      const right = time[1];
      const style = {
        left: ~~((left - start) / scale),
        width: 1800000 / scale,  // 30 min * 60 sec * 1000 ms
        height: 25,
        position: 'absolute',
        display: 'block',
        borderLeft: '1px #000 solid',
        marginLeft: '-1px',
        backgroundColor: 'red',
        marginBottom: 50 * row_count,
        zIndex: 100,
      };
      // console.log(style);
      return <div key={left} style={style}>{left.format('HH:mm')}</div>
    });

    return <div className="header">{header}</div>
  }
}


class TimeLineSectionRow extends React.Component {
  render() {
    const items = this.props.items;
    const scale = this.props.timeline.scale;
    const start = this.props.timeline.start;
    const elements = items.map((data, index) => {
      // console.log(data);
      const left = data[0];
      const right = data[1];
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
      return <div key={left} style={style}>{left.format('HH:mm')}</div>
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
    const start = this.props.timeline.start;
    const items = this.props.timeline.items;

    // add header for section
    const header = <TimeLineSectionHeaderRow height={25} timeline={this.props.timeline} />;

    // add rows with elements
    const rows = items.map(data =>
      <TimeLineSectionRow key={data.id} timeline={this.props.timeline} items={data.times}/>
    );
    return <div className='time-line'>
      {header}
      {rows}
    </div>
  }
}

class FixedColumnSection extends React.Component {
  render() {
    const rows = this.props.timeline.items.map(item =>
      <div key={item.title} className='row'>{item.title}</div>
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
};

export { Timeline }
