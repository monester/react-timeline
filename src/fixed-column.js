import React from 'react'
import style from './timeline.module.css'

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

export default FixedColumnSection
