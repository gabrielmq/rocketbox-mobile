import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import { distanceInWords } from 'date-fns';
import pt from 'date-fns/locale/pt';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import socket from 'socket.io-client';

import styles from './styles';
import api from '../../services/api';

export default class Box extends Component {
  state = {
    box: ''
  };

  async componentDidMount() {
    const box = await AsyncStorage.getItem('@RocketBox:box');
    this.subscribeToNewFile(box);

    const response = await api.get(`boxes/${box}`);
    this.setState({ box: response.data });
  }

  subscribeToNewFile = async box => {
    const io = socket('https://omnistack-rocketbox-api.herokuapp.com');

    io.emit('connectRoom', box);
    io.on('file', data => {
      this.setState({
        box: { ...this.state.box, files: [data, ...this.state.box.files] }
      });
    });
  };

  renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => this.openFile(item)} style={styles.file}>
      <View style={styles.fileInfo}>
        <Icon name="insert-drive-file" size={24} color="#a5cfff" />
        <Text style={styles.fileTitle}>{item.title}</Text>
      </View>
      <View style={styles.fileDateContainer}>
        <Text style={styles.fileDate}>
          Criado há{' '}
          {distanceInWords(item.createdAt, new Date(), { locale: pt })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  openFile = async file => {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/${file.title}`;
      await RNFS.downloadFile({ fromUrl: file.url, toFile: filePath });
      await FileViewer.open(filePath);
    } catch (err) {
      console.log('Arquivo não suportado');
    }
  };

  handleUpload = () => {
    ImagePicker.launchImageLibrary({}, async upload => {
      if (upload.error) {
        console.log('ImagePicker error');
      } else if (upload.didCancel) {
        console.log('Cancelado pelo usuário');
      } else {
        const data = new FormData();
        const [prefix, suffix] = upload.fileName.split('.');
        const ext = suffix.toLocaleLowerCase() === 'heic' ? 'jpg' : suffix;
        data.append('file', {
          uri: upload.uri,
          type: upload.type,
          name: `${prefix}.${ext}`
        });

        api.post(`boxes/${this.state.box._id}/files`, data);
      }
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.boxTitle}>{this.state.box.title}</Text>

        <FlatList
          style={styles.list}
          data={this.state.box.files}
          keyExtractor={file => file._id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={this.renderItem}
        />

        <TouchableOpacity style={styles.fab} onPress={this.handleUpload}>
          <Icon name="cloud-upload" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }
}
