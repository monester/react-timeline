import React, { Component } from 'react'
import moment from 'moment'

import {Timeline} from 'react-timeline'
// import {Timeline} from './timeline'


class Clan extends React.Component {
  render() {
    return <div>{this.props.clan_id}</div>
  }
}

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
    let title = this.props.data.clan_a.tag;
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
    fetch('http://battles.universe.cc/update/P_BY').then(function(response) {
      return response.json();
    }).then(function(response) {
      let items = [];
      for(let p of  response.provinces) {
        const rounds = p.rounds;
        const times = rounds.map(r => {
          return {
            start_time: moment(r.time),
            end_time: moment(r.time).add({minutes: 30}),
            clan_a: r.clan_a,
            clan_b: r.clan_b,
          }
        });
        p['id'] = p['province_id'];
        p['times'] = times;
      }
      app.setState({items: response.provinces});
    });
    // fetch('https://na.wargaming.net/globalmap/game_api/clan/1000051015/battles').then(function(response) {
    //   return response.json();
    // }).then(function(response) {
    //   console.log(response);
    // });

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
