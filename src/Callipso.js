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
  state = {
    modalVisible: false,
  };
  items = {};
  itemsMeasurements = {};
  currentActiveItem = null;
  _imageRef = null;
  _animatedValue = new Animated.Value(0);
  _bodyAnimatedValue = new Animated.Value(0);

  onItemLayout = (node, id) => {
    this.items[id] = node;
  };

  activateItem = (id) => {
    const item = this.items[id];
    setTimeout(() => {
      item.measureInWindow((x, y, width, height) => {
        this.itemsMeasurements[id] = { x, y, width, height };
        this.currentActiveItem = id;
        this.setState({ modalVisible: true }, () => {
          item.setNativeProps({ style: { opacity: 0 } });
          Animated.parallel([
            Animated.timing(this._animatedValue, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(this._bodyAnimatedValue, {
              toValue: 1,
              duration: 300,
              delay: 200,
              useNativeDriver: true,
            }),
          ]).start();
        });
      });
    }, 0);
  };
  deactivateItem = () => {
    Animated.parallel([
      Animated.timing(this._animatedValue, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(this._bodyAnimatedValue, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
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
    const aspectRatio = layout.width / layout.height;
    const screenAspectRatio = screenWidth / screenHeight;
    const destinationDimension = {
      width: screenWidth,
      height: 250,
      pageX: 0,
      pageY: 0,
    };
    const destRightDimension = {
      width: screenWidth,
      height: 250,
      pageX: 0,
      pageY: 0,
    };
    if (aspectRatio - screenAspectRatio > 0) {
      destRightDimension.width = aspectRatio * destRightDimension.height;
      destRightDimension.pageX -= (destRightDimension.width - destinationDimension.width) / 2;
    } else {
      destRightDimension.height = destRightDimension.width / aspectRatio;
      destRightDimension.pageY -= (destRightDimension.height - destinationDimension.height) / 2;
    }
    const translateInitX = layout.x + layout.width / 2;
    const translateInitY = layout.y + layout.height / 2;
    const translateDestX = destRightDimension.pageX + destRightDimension.width / 2;
    const translateDestY = destRightDimension.pageY + destRightDimension.height / 2;
    const openingInitTranslateX = translateInitX - translateDestX;
    const openingInitTranslateY = translateInitY - translateDestY;
    const openingInitScale = layout.width / destRightDimension.width;
    const scale = this._animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [openingInitScale, 1],
    });
    const translateX = this._animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [openingInitTranslateX, 0],
    });
    const translateY = this._animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [openingInitTranslateY, 0],
    });
    const opacity = this._animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const bodyTranslateY = this._animatedValue.interpolate({
      inputRange: [0, 0.6, 1],
      outputRange: [400, 400, 250],
    });
    const imageStyle = {
      width: destRightDimension.width,
      height: destRightDimension.height,
      left: destRightDimension.pageX,
      top: destRightDimension.pageY,
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
      height: screenHeight - 250,
      width: screenWidth,
      transform: [{ translateY: bodyTranslateY }],
      opacity,
    };
    return (
      <View style={styles.modal}>
        <TouchableWithoutFeedback onPress={this.deactivateItem}>
          <Animated.Image
            source={source.props.source}
            style={imageStyle}
            ref={node => (this._imageRef = node)}
          />
        </TouchableWithoutFeedback>
        <Animated.View style={bodyStyle}>
          {this.props.renderItemBody({
            item: this.props.data[this.currentActiveItem],
            index: this.currentActiveItem,
          })}
        </Animated.View>
      </View>
    );
  };
  render() {
    const containerStyles = {
      opacity: this._animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.7],
      }),
      transform: [
        {
          scale: this._animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.9],
          }),
        },
      ],
    };
    return (
      <Animated.View style={containerStyles}>
        <FlatList {...this.props} renderItem={this._renderItem} />
        <Modal
          onRequestClose={this.deactivateItem}
          visible={this.state.modalVisible}
          animationType="none"
          transparent
        >
          {this.renderModal()}
        </Modal>
      </Animated.View>
    );
  }
}

export default Callipso;
