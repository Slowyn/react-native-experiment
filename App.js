/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Image } from 'react-native';
import Callipso from './src/Callipso';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  listElementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
    marginVertical: 10,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderBottomColor: 'rgba(0,0,0,.1)',
    borderTopColor: 'rgba(0,0,0,.1)',
    backgroundColor: '#fff',
  },
  listElementThumbnail: {
    width: '40%',
    height: '100%',
    resizeMode: 'cover',
    marginRight: 20,
  },
});

type ListElement = {
  title: string,
  uri: string,
  id: number,
};

type ListData = ListElement[];

const data: ListData = [
  {
    title: 'Test 1',
    uri:
      'https://images.pexels.com/photos/207962/pexels-photo-207962.jpeg?h=350&auto=compress&cs=tinysrgb',
    id: 0,
  },
  {
    title: 'Test 2',
    uri:
      'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?h=350&auto=compress&cs=tinysrgb',
    id: 1,
  },
  {
    title: 'Test 3',
    uri:
      'https://images.pexels.com/photos/355296/pexels-photo-355296.jpeg?h=350&auto=compress&cs=tinysrgb',
    id: 2,
  },
  {
    title: 'Test 4',
    uri:
      'https://images.pexels.com/photos/114735/pexels-photo-114735.jpeg?h=350&auto=compress&cs=tinysrgb',
    id: 3,
  },
  {
    title: 'Test 5',
    uri:
      'https://images.pexels.com/photos/87452/flowers-background-butterflies-beautiful-87452.jpeg?h=350&auto=compress&cs=tinysrgb',
    id: 4,
  },
  {
    title: 'Test 6',
    uri:
      'https://images.pexels.com/photos/88647/pexels-photo-88647.jpeg?h=350&auto=compress&cs=tinysrgb',
    id: 5,
  },
  {
    title: 'Test 7',
    uri:
      'https://images.pexels.com/photos/92340/pexels-photo-92340.jpeg?h=350&auto=compress&cs=tinysrgb',
    id: 6,
  },
];

export default class App extends Component<{}> {
  renderItem = ({ item }) => (
    <View style={styles.listElementContainer}>
      <Image source={{ uri: item.uri }} style={styles.listElementThumbnail} />
      <Text>{item.title}</Text>
    </View>
  );
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Callipso renderItem={this.renderItem} data={data} keyExtractor={item => item.id} />
      </View>
    );
  }
}
