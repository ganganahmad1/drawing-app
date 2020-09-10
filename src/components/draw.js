import React, {Component} from 'react'
import {
  SafeAreaView,
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native'
import SketchDraw from 'react-native-sketch-draw'
import ViewShot from 'react-native-view-shot'
import CameraRoll from '@react-native-community/cameraroll'
import Share from 'react-native-share'

const SketchDrawConstants = SketchDraw.constants

const tools = {}

tools[SketchDrawConstants.toolType.pen.id] = {
  id: SketchDrawConstants.toolType.pen.id,
  name: SketchDrawConstants.toolType.pen.name,
  nextId: SketchDrawConstants.toolType.eraser.id,
}
tools[SketchDrawConstants.toolType.eraser.id] = {
  id: SketchDrawConstants.toolType.eraser.id,
  name: SketchDrawConstants.toolType.eraser.name,
  nextId: SketchDrawConstants.toolType.pen.id,
}

class Draw extends Component {
  constructor(props) {
    super(props)
    this.state = {
      color: [
        'black',
        'white',
        'red',
        'yellow',
        'green',
        'blue',
        '#fc9d9d',
        '#32e0c4',
        '#848ccf',
        '#4b5d67',
        '#ff5200',
        '#f67280',
      ],
      toolSelected: SketchDrawConstants.toolType.pen.id,
      penColor: 'black',
      isSelected: 0,
    }
  }

  isEraserToolSelected() {
    return this.state.toolSelected === SketchDrawConstants.toolType.eraser.id
  }

  toolChangeClick() {
    this.setState({toolSelected: tools[this.state.toolSelected].nextId})
  }

  getToolName() {
    return tools[this.state.toolSelected].name
  }

  onSketchSave(saveEvent) {
    this.props.onSave && this.props.onSave(saveEvent)
  }

  onChangePenColor = (id) => {
    this.setState({isSelected: id, penColor: this.state.color[id]})
  }

  getPermissionAndroid = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Image Download Permission',
          message: 'Your permission is required to save images to your device',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true
      }
      Alert.alert(
        '',
        'Your permission is required to save images to your device',
        [{text: 'OK', onPress: () => {}}],
        {cancelable: false},
      )
    } catch (err) {
      // handle error as you please
      console.log('err', err)
    }
  }
  saveImage = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await this.getPermissionAndroid()
        if (!granted) {
          return
        }
      }

      this.refs.viewShot.capture().then((uri) => {
        const image = CameraRoll.save(uri, 'photo')
        if (image) {
          Alert.alert(
            '',
            'Image saved successfully.',
            [{text: 'OK', onPress: () => {}}],
            {cancelable: false},
          )
        }
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  shareImage = () => {
    this.refs.viewShot.capture().then((uri) => {
      const image = Share.open({url: uri})
    })
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ViewShot
          style={{flex: 1}}
          ref="viewShot"
          options={{format: 'jpg', quality: 0.9}}>
          <SketchDraw
            style={{flex: 1, backgroundColor: 'white'}}
            ref="sketchRef"
            selectedTool={this.state.toolSelected}
            toolColor={this.state.penColor}
            onSaveSketch={this.onSketchSave.bind(this)}
            localSourceImagePath={this.props.localSourceImagePath}
          />
        </ViewShot>
        <View style={{flexDirection: 'row'}}>
          {this.state.color.map((item, key) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.boxColor,
                {
                  backgroundColor: item,
                },
                this.state.isSelected == key
                  ? {borderWidth: 3}
                  : {borderWidyh: 1},
              ]}
              onPress={() => this.onChangePenColor(key)}
            />
          ))}
        </View>
        <View style={{flexDirection: 'row', backgroundColor: '#EEE'}}>
          <TouchableHighlight
            underlayColor={'#CCC'}
            style={{flex: 1, alignItems: 'center', paddingVertical: 20}}
            onPress={() => {
              this.refs.sketchRef.clearSketch()
            }}>
            <Text style={{color: '#888', fontWeight: '600'}}>CLEAR</Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={'#CCC'}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 20,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: '#DDD',
            }}
            onPress={() => {
              this.saveImage()
            }}>
            <Text style={{color: '#888', fontWeight: '600'}}>SAVE</Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={'#CCC'}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: this.isEraserToolSelected()
                ? '#CCC'
                : 'rgba(0,0,0,0)',
            }}
            onPress={this.toolChangeClick.bind(this)}>
            <Text style={{color: '#888', fontWeight: '600'}}>ERASER</Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={'#CCC'}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => this.shareImage()}>
            <Text style={{color: '#888', fontWeight: '600'}}>Share</Text>
          </TouchableHighlight>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  boxColor: {
    borderWidth: 1,
    width: 40,
    height: 40,
    borderRadius: 10,
    margin: 5,
    borderColor: '#1f4068',
  },
})

export default Draw
