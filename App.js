import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, Button, AppState } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

export default function App() {

  const state = useRef(AppState.currentState);

  const [recording, setRecording] = useState();

  async function getPermission() {
    await Audio.requestPermissionsAsync()
      .then((permission) => {
        console.log("Permission Granted: ", permission.granted);
      })
      .catch(err => {
        console.log(err);
      });
  }

  /* async function startRecording() {
      try {

          await Audio.setAudioModeAsync({
              allowsRecordingIOS: true,
              playsInSilentModeIOS: true,
              staysActiveInBackground: true
          });

          const { recording } = await Audio.Recording.createAsync(
              Audio.RecordingOptionsPresets.HIGH_QUALITY
          );

          setRecording(recording);

          setIsRecording(true);

          console.log("Recording has started");

          setTimeout(async () => {
              try {

                  await stopRecording()


                  setIsRecording(false);

                  console.log("Recording has stopped");

                  moveFile(recording.getURI());

              } catch (error) {
                  console.log("Failed to stop recording", error);
              }
          }, 10000);
      } catch (error) {
          console.log("Failed to start recording", error);
      }
  } */

  async function startRecording() {
    try {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    /* await Audio.setAudioModeAsync(
      {
        allowsRecordingIOS: false,
      }
    ); */
    const uri = recording.getURI();

    console.log('Recording stopped');

    moveFile(uri);
  }

  async function moveFile(uri) {

    console.log("Moving recorded file");

    const fileName = `${Date.now()}.aac`;

    const dir = FileSystem.documentDirectory + 'recordings/';

    try {
      const path = await FileSystem.getInfoAsync(dir);

      if (!path.exists) {
        await FileSystem.makeDirectoryAsync(
          dir, { intermediates: true }
        );
        console.log("Directory created successfully");
      } else {
        console.log("Directory already exists");
      }

      await FileSystem.moveAsync({
        from: uri,
        to: dir + fileName
      });

      console.log("File moved successfully");

      const content = await FileSystem.readDirectoryAsync(dir);

      console.log("Data in recordings directory: ", content);

    } catch (error) {
      console.log("failed to move the recoreded file", error);
    }
  }

  async function DeleteDir() {
    try {
      const dir = FileSystem.documentDirectory + "recordings/";

      const test = await FileSystem.readDirectoryAsync(dir);
      console.log("this is the content to be deleted: " + test);
      await FileSystem.deleteAsync(dir);
      console.log("deleted now: " + test);
    } catch (e) {
      console.log("couldnt delete" + e);
    }
  }

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (e) => {
      console.log("Application state: ", e);

      state.current = e;
    });

    getPermission();

    setInterval(async () => {
      if(!recording) {
        startRecording()
      }
    }, 25000);


    return () => {
      subscription.remove()
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (recording) {
        stopRecording()
      }
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
    }
  }, [recording])

  return (
    <View style={styles.container}>
      <Text style={{ textAlign: 'center' }}>Status: {recording ? 'Recording' : 'Not Recording'}</Text>
      <View style={{ paddingBottom: 30 }}></View>
      <Button title="Delete All Files" onPress={DeleteDir} />
      <Button title="Start" onPress={startRecording} />
      <Button title="Stop" onPress={stopRecording} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
