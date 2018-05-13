import React from 'react'
import style from './timeline.module.css'

class FixedColumnSection extends React.Component {
  render () {
    const Cell = this.props.timeline.rowCell
    const items = this.props.timeline.items
    const height = this.props.timeline.rowHeight;

    const rows = items.map(item =>
      <div key={item.id} className={style.row} style={{height: height}}><Cell data={item}/></div>
    )
    return <div className={style.fixedColumn}>
      <div className={style.row}/>
      {rows}
    </div>
  }
}

export default FixedColumnSection
