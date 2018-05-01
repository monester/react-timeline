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
    return <div>{title}</div>
  }
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { items: [] }
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
    const min30 = 30*60*1000;
    app.setState({
      items: [{
        province_name: 'xx', id: 'xx',
        times: [{
          time: moment(Math.ceil(moment() / min30) * min30),
          duration: min30, clan_a: null, clan_b: null,
        }, {
          time: moment(Math.ceil(moment() / min30) * min30 + min30),
          duration: min30, clan_a: null, clan_b: null,
        }]
      }, {
        province_name: 'yy', id: 'yy',
        times: [{
          time: moment(Math.ceil(moment() / min30) * min30 + min30*4),
          duration: min30, clan_a: null, clan_b: null,
        }, {
          time: moment(Math.ceil(moment() / min30) * min30 + min30*5),
          duration: min30, clan_a: null, clan_b: null,
        }]
      }]
    })
  }

  render () {
    return (
      <div>
        <Timeline
          rowcell={RowCell}
          timecell={TimeCell}
          items={this.state.items}
        />
      </div>
    )
  }
}
