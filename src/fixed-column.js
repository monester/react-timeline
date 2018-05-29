import React from 'react'
import style from './timeline.module.css'

class FixedColumnSection extends React.Component {
  render () {
    const Cell = this.props.timeline.rowCell
    const items = this.props.timeline.items
    const height = this.props.timeline.rowHeight;
    const fixedWidth = this.props.timeline.fixedWidth;

    const extraStyle = {
      height: height,
      width: fixedWidth,
    }

    const rows = items.map(item =>
      <div key={item.id} className={style.row} style={extraStyle}><Cell data={item}/></div>
    )
    return <div className={style.fixedColumn} style={{width: fixedWidth}}>
      <div className={style.row} style={{height: 51, width: fixedWidth}}/>
      {rows}
    </div>
  }
}

export default FixedColumnSection
