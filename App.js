import React from 'react';
import {
  View,
  Text as RNText,
  Dimensions,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import Svg, {G, Text, TSpan, Path} from 'react-native-svg';
import * as d3Shape from 'd3-shape';
import color from 'randomcolor';
const {width} = Dimensions.get('screen');
const numberOfSegments = 12;
const wheelSize = width * 0.9;
const fontSize = 26;
const oneTurn = 360;
const angleBySegment = oneTurn / numberOfSegments;
const angleOffset = angleBySegment / 2;
const customWinnerIndex = 10;

const colors = color({
  luminosity: 'dark',
  count: numberOfSegments,
});

const makeWheel = () => {
  const data = Array.from({length: numberOfSegments}).fill(1);
  const arcs = d3Shape.pie()(data);
  let i = 1;
  return arcs.map((arc, index) => {
    const instance = d3Shape
      .arc()
      .padAngle(0.002)
      .outerRadius(width / 2)
      .innerRadius(20);

    return {
      path: instance(arc),
      color: colors[index],
      value: i++,
      centroid: instance.centroid(arc),
    };
  });
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.spinValue = new Animated.Value(0);
  }

  componentDidMount() {
    this.spinValue.addListener((event) => {
      this.angle = event.value;
    });
  }

  spin = () => {
    Animated.decay(this.spinValue, {
      velocity: 4,
      deceleration: 0.995,
      useNativeDriver: true,
    }).start(() => {
      let currentPosOf1 = this.angle % 360;
      let diffWithCurrPosition = ((oneTurn + 90) - currentPosOf1);
      let winnerIndex = Math.floor(diffWithCurrPosition / angleBySegment);
      if(winnerIndex >= numberOfSegments){
        winnerIndex -= numberOfSegments;
      }
      let winnerAngle = ((Math.abs(Math.abs(customWinnerIndex - winnerIndex) - numberOfSegments)) * angleBySegment) - (angleBySegment / 2);



      if(winnerIndex !== customWinnerIndex){

        Animated.timing(this.spinValue, {
          toValue: winnerAngle + 90,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true
        }).start(() => {
          console.log('done', this.angle, 'this.angle')
        });
        
      }

    });
  };


  _getWinnerIndex = () => {
    const deg = Math.abs(Math.round(this.angle % oneTurn));
    return Math.floor(deg / angleBySegment);
  };

  _wheelPaths = makeWheel();

  _renderSvgWheel = () => {
    const spin = this.spinValue.interpolate({
      inputRange: [-oneTurn, 0, oneTurn],
      outputRange: [`-${oneTurn}deg`, `0deg`, `${oneTurn}deg`],
    });
    return (
      <View style={styles.container}>
        <RNText>Total rewards: {numberOfSegments}</RNText>
        <RNText>Custom Winner: {customWinnerIndex + 1}</RNText>
        <Animated.View
          style={{
            transform: [{rotate: spin}],
          }}>
          <Svg
            width={wheelSize}
            height={wheelSize}
            viewBox={`0 0 ${width} ${width}`}>
            <G y={width / 2} x={width / 2}>
              {this._wheelPaths.map((arc, i) => {
                const [x, y] = arc.centroid;
                const number = arc.value.toString();
                return (
                  <G key={`arc-${i}`}>
                    <Path d={arc.path} fill={arc.color} />
                    <G
                      rotation={(i * oneTurn) / numberOfSegments + angleOffset}
                      origin={`${x}, ${y}`}>
                      <Text
                        x={x}
                        y={y - 70}
                        fill="white"
                        textAnchor="middle"
                        fontSize={fontSize}>
                        {Array.from({length: number.length}).map((_, j) => {
                          return (
                            <TSpan
                              x={x}
                              dy={fontSize}
                              key={`arc-${i}-slice-${j}`}>
                              {number.charAt(j)}
                            </TSpan>
                          );
                        })}
                      </Text>
                    </G>
                  </G>
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        {this._renderSvgWheel()}
        <TouchableOpacity onPress={this.spin}>
          <RNText>Spin</RNText>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
