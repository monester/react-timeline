import React from 'react'

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

export {DefaultRowCell, DefaultTimeCell}
