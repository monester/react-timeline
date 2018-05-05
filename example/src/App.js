/* eslint-disable */
import React, { Component } from 'react'
import moment from 'moment'

import {Timeline} from './timeline'


// class Clan extends React.Component {
//   render() {
//     return <div>{this.props.clan_id}</div>
//   }
// }

class RowCell extends React.Component {
  render() {
    return <div style={{backgroundColor: '#fff', height: '100%', width: '100%'}}>
      <a
        href={'https://ru.wargaming.net/globalmap/#province/' + this.props.data.id}>
      {this.props.data.province_name}
      </a>
    </div>
  }
}

class TimeCell extends React.Component {
  render() {
    // console.log(this.props.data);
    let title = this.props.data.clan_a && this.props.data.clan_a.tag;
    if (this.props.data.clan_b) {
      title = `${title} vs ${this.props.data.clan_b.tag}`
    }
    return <div>{moment(this.props.data.time).format('HH:mm')} - {moment(this.props.data.time+this.props.data.duration).format('HH:mm')} {title}</div>
  }
}

const min30 = 30*60*1000;
const hour = 3600000;
const day = hour * 24;
const data = [{
  province_name: 'xx', id: 'xx',
  times: [{
    time: moment(Math.ceil(moment() / min30) * min30 + min30),
    duration: min30/2, clan_a: null, clan_b: null,
  }, {
    time: moment(Math.ceil(moment() / min30) * min30 + min30 * 1.5),
    duration: min30/2, clan_a: null, clan_b: null,
  }, {
    time: moment(Math.ceil(moment() / min30) * min30 + min30*3),
    duration: min30*1.5, clan_a: null, clan_b: null,
  }]
}, {
  province_name: 'yy', id: 'yy',
  times: [{
    time: moment(Math.ceil(moment() / min30) * min30 + min30 * 8 - min30 * 0.1),
    duration: min30 / 2, clan_a: null, clan_b: null,
  }, {
    time: moment(Math.ceil(moment() / min30) * min30 + min30 * 8.5),
    duration: min30 / 2, clan_a: null, clan_b: null,
  }, {
    time: moment(Math.ceil(moment() / min30) * min30 + min30 * 9),
    duration: min30, clan_a: null, clan_b: null,
  }, {
    time: moment(Math.ceil(moment() / min30) * min30 + min30 * 12),
    duration: min30, clan_a: null, clan_b: null,
  }]
}, {
  province_name: 'fort', id: 'fort',
  times: [{
    time: moment(Math.ceil(moment() / min30) * min30 + min30*8),
    duration: min30/2, clan_a: null, clan_b: null,
  }, {
    time: moment(Math.ceil(moment() / min30) * min30 + min30*8.5),
    duration: min30/2, clan_a: null, clan_b: null,
  }, {
    time: moment(Math.ceil(moment() / min30) * min30 + min30*9),
    duration: min30, clan_a: null, clan_b: null,
  }, {
    time: moment(Math.ceil(moment() / min30) * min30 + min30*48),
    duration: min30, clan_a: null, clan_b: null,
  }]
}/* */];

const headerGroup = [{
  title: moment(~~(moment()/day) * day +  32400000).format(),
  time: ~~(moment()/day) * day +  32400000,
  duration: day
}, {
  title: moment(~~(moment()/day) * day + day + 32400000).format(),
  time: ~~(moment()/day) * day + day+  32400000,
  duration: day
}];


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { items: data, headerGroup: headerGroup }
  }

  componentDidMount() {
    const app = this;
    /*fetch('http://battles.universe.cc/update/P_BY').then(function(response) {
      return response.json();
    }).then(function(response) {
      for(let p of  response.provinces) {
        const rounds = p.rounds;
        const times = rounds.map(r => {
          return {
            time: moment(r.time),
            duration: 30*60*1000,
            clan_a: r.clan_a,
            clan_b: r.clan_b,
          }
        });
        p['id'] = p['province_id'];
        p['times'] = times;
      }
      app.setState({items: response.provinces});
    }); */
    // console.log(JSON.stringify(data, null, '  '));
    // console.log(data);
    // app.setState({items: data})
  }

  render () {
    const min30 = 30*60*1000;
    return (
      <div>
        <p>TEST</p>

        <div style={{width: 6400, margin: 20}}>
        <Timeline
          start={moment(Math.ceil(moment() / min30) * min30)}
          rowcell={RowCell}
          timecell={TimeCell}
          items={this.state.items}
          headerGroup={this.state.headerGroup}
        />
      </div>
    </div>)
  }
}
