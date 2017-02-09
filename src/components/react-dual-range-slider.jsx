import React, {PropTypes} from "react";
import { FormattedMessage } from "react-intl";

import styles from "../../src/styles/react-dual-range-slider.css";
import messages from "../lang/default-messages";

export default class ReactDualRangeSlider extends React.Component {



  constructor(props) {
    super(props);
    let limits = this.props.limits.slice().sort(this.sortValues);
    let values = this.props.values.slice().sort(this.sortValues);
    let size = Math.abs(limits[1]-limits[0]);

    values[0] = values[0]<limits[0] ? limits[0] : values[0]>limits[1] ? limits[1] : values[0];
    values[1] = values[1]>limits[1] ? limits[1] : values[1]<limits[0] ? limits[0] : values[1];

    this.state = {
      limits: limits,
      size: size,
      values:values,
      reverse: this.props.reverse,
      isSelDown: false,
      indexSelDown: 0,
      moveStartValue: 0,
      moveCurrentValue: 0,
      moveStartX: 0,
      moveCurrentX: 0,
      boxWidth:0, 
      formatFunc: this.props.formatFunc, 
      onChange: this.props.onChange
    }
  }

  /**
   * START TO MOVE
   */

  startToMove(event, index) {
    this.setState({
      isSelDown:true,
      indexSelDown: index,
      moveStartValue: this.state.values[index],
      moveCurrentValue: this.state.values[index],
      moveStartX: event.clientX,
      moveCurrentX: event.clientX,
      boxWidth:event.currentTarget.parentElement.offsetWidth
    });
    event.stopPropagation();
  }

  onMouseDown0(event) {
    this.startToMove(event, 0);
  }

  onMouseDown1(event) {
    this.startToMove(event, 1);
  }


  /**
   * MOVE
   */

  onMouseMove(event) {
    
    if(this.state.isSelDown) {
      const currentX = event.clientX;
      this.setState({
        moveCurrentX: currentX,
        moveCurrentValue: this.getMoveCurrentValue (currentX)
      });
    }
  }

  getMoveCurrentValue (moveCurrentX) {
    let moveBoxProportion = (moveCurrentX-this.state.moveStartX)/this.state.boxWidth;
    if(this.state.reverse) {
      moveBoxProportion = moveBoxProportion*-1;
    }
    const moveIntoLimit = this.state.size * moveBoxProportion;
    let moveCurrentValue = this.state.moveStartValue+moveIntoLimit;
    moveCurrentValue = moveCurrentValue<this.state.limits[0]?this.state.limits[0]:moveCurrentValue;
    moveCurrentValue = moveCurrentValue>this.state.limits[1]?this.state.limits[1]:moveCurrentValue;

    return moveCurrentValue;
  }

  formatOutput () {
    const values = this.getValues();
    return [this.state.formatFunc(values[0]), this.state.formatFunc(values[1])];
  }

  /**
   * STOP TO MOVE
   */
  
  stopToMove(event) {
    if(this.state.isSelDown) {
      let values = this.getValues();
      this.setState({
        values: values,
        isSelDown: false
      });
      this.onChange();
    }
    event.stopPropagation();
  }

  onMouseLeave(event) {
    this.stopToMove(event);
  }

  onMouseUp(event) {
    this.stopToMove(event);
  }

  /**
   * GET 
   */

  getLimits() {
    return this.state.limits.slice();
  }

  getDisplayLimits() {
    let limits = this.getLimits();
    if(this.state.reverse) {
      limits.reverse();
    }
    return [this.state.formatFunc(limits[0]), this.state.formatFunc(limits[1])];
  }

  getValues() {
    let values = this.state.values.slice();
    if(this.state.isSelDown) {
      values[this.state.indexSelDown] = this.state.moveCurrentValue;
    }
    return values;
  }

  getLeftPositions() {

    const values = this.getValues();

    const limits = this.getLimits();

    const size = this.state.size;

    const left = [values[0]-limits[0], values[1]-limits[0]];
    const leftPos = [left[0]/size*100, left[1]/size*100];

    if(this.state.reverse) {
      return [100-leftPos[0], 100-leftPos[1]];
    }
    return leftPos;
  }

  sortValues(a, b) { return a-b; }

  /**
   * onChange
   */

  onChange() {
    this.state.onChange(this.formatOutput().sort(this.sortValues));
  }

  render() {


    const displayValues = this.formatOutput();

    const displayLimits = this.getDisplayLimits();

    const leftPos = this.getLeftPositions();

    let crossLinePos = leftPos.slice();
    crossLinePos.sort(this.sortValues);
    crossLinePos[1] = 100-crossLinePos[1];

    const styleCrossline = {
      left:crossLinePos[0]+'%',
      right:crossLinePos[1]+'%'
    };

    const styleSelector0 = {
      left:leftPos[0]+'%'
    };

    const styleSelector1 = {
      left:leftPos[1]+'%'
    };

    return (
      <div className={styles.component} 
        onMouseMove={this.onMouseMove.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        data-name='component'>

        <div className={styles.limits}>
          <div>{displayLimits[0]}</div>
          <div>{displayLimits[1]}</div>
        </div>

        <div className={styles.sliders}>
          <div className={styles.line}><div className={styles.crossLine} style={styleCrossline}></div></div>
          <div 
            className={[styles.selector, styles.selector0].join(' ')} 
            style={styleSelector0}
            onMouseDown={this.onMouseDown0.bind(this)}
            >
            <div></div>
          </div>
          <div
            className={[styles.selector, styles.selector1].join(' ')} 
            style={styleSelector1}
            onMouseDown={this.onMouseDown1.bind(this)}
            >
            <div></div>
          </div>
        </div>
        
        <div className={styles.values}>
          <div className={styles.value} style={styleSelector0}>{displayValues[0]}</div>
          <div className={styles.value} style={styleSelector1}>{displayValues[1]}</div>
        </div>

      </div>
    );
  }
}

ReactDualRangeSlider.displayName = "ReactDualRangeSlider";

ReactDualRangeSlider.propTypes = {
  limits: PropTypes.arrayOf(PropTypes.number),
  values: PropTypes.arrayOf(PropTypes.number),
  reverse: PropTypes.bool,
  formatFunc : PropTypes.func,
  onChange: PropTypes.func
};

ReactDualRangeSlider.defaultProps = {
  limits: [0, 100],
  values: [0, 100],
  reverse: false,
  formatFunc: function(value) {
    return value;
  },
  onChange: function() {}
};
