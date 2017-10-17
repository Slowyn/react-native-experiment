import React, { Component } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Text,
  Image,
  Dimensions,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

class Callipso extends Component {
  items = {};
  itemsMeasurements = {};
  currentActiveItem = null;
  state = {
    modalVisible: false,
  };
  _animatedValue = new Animated.Value(0);

  onItemLayout = (node, id) => {
    this.items[id] = node;
  };

  activateItem = (id) => {
    const item = this.items[id];
    setTimeout(() => {
      item.measureInWindow((x, y, width, height) => {
        this.itemsMeasurements[id] = { x, y, width, height };
        item.setNativeProps({ style: { opacity: 0 } });
        this.currentActiveItem = id;
        this.setState({ modalVisible: true });
      });
    }, 0);
  };
  deactivateItem = () => {
    Animated.timing(this._animatedValue, {
      toValue: 0,
      duration: 500,
    }).start(() => {
      const item = this.items[this.currentActiveItem];
      item.setNativeProps({ style: { opacity: 1 } });
      this.currentActiveItem = null;
      this.setState({ modalVisible: false });
    });
  };

  _renderItem = (data) => {
    const { renderItem, keyExtractor } = this.props;
    const id = keyExtractor(data.item);
    const setRefForImage = (element) => {
      if (element.type.displayName === 'Text') {
        return element;
      }
      if (element.type.displayName === 'Image') {
        return React.cloneElement(element, { ref: node => this.onItemLayout(node, id) });
      }
      if (
        element.type.displayName !== 'Image' &&
        React.Children.count(element.props.children.length) === 0
      ) {
        return element;
      }
      if (
        element.type.displayName !== 'Image' &&
        element.type.displayName !== 'Text' &&
        React.Children.count(element.props.children.length) > 0
      ) {
        return React.Children.map(element.props.children, setRefForImage);
      }
    };
    const children = React.cloneElement(renderItem(data), {
      children: setRefForImage(renderItem(data)),
    });
    return (
      <TouchableWithoutFeedback onPress={() => this.activateItem(id)}>
        {children}
      </TouchableWithoutFeedback>
    );
  };

  renderModal = () => {
    const source = this.items[this.currentActiveItem];
    const layout = this.itemsMeasurements[this.currentActiveItem];
    if (source == null || layout == null) return <View />;
    const scaleFactor = screenWidth / layout.width;
    const scale = this._animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, scaleFactor],
    });
    const translateX = this._animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [layout.x, (layout.width * scaleFactor - layout.width) / 2],
    });
    const translateY = this._animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [layout.y, (layout.height * scaleFactor - layout.height) / 2],
    });
    const opacity = this._animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const bodyTranslateY = this._animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [layout.y, layout.height * scaleFactor],
    });
    const bodyTranslateX = this._animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-layout.width, 0],
    });
    const imageStyle = {
      width: layout.width,
      height: layout.height,
      transform: [
        {
          translateX,
        },
        {
          translateY,
        },
        {
          scale,
        },
      ],
    };
    const bodyStyle = {
      position: 'absolute',
      left: 0,
      top: 0,
      height: screenHeight - layout.height * scaleFactor,
      width: screenWidth,
      transform: [{ translateY: bodyTranslateY }, { translateX: bodyTranslateX }],
      opacity,
      backgroundColor: 'lime',
    };
    Animated.timing(this._animatedValue, {
      toValue: 1,
      duration: 300,
    }).start();
    return (
      <TouchableWithoutFeedback onPress={this.deactivateItem}>
        <View style={styles.modal}>
          <Animated.Image source={source.props.source} style={imageStyle} />
          <Animated.View style={bodyStyle} />
        </View>
      </TouchableWithoutFeedback>
    );
  };
  render() {
    return (
      <View>
        <FlatList {...this.props} renderItem={this._renderItem} />
        <Modal visible={this.state.modalVisible} animationType="none" transparent>
          {this.renderModal()}
        </Modal>
      </View>
    );
  }
}

export default Callipso;
