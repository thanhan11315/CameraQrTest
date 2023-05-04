import 'react-native-reanimated';
import React, {useEffect, useState, useRef} from 'react';
import {StyleSheet, Text, View, Alert, Animated} from 'react-native';
import {useCameraDevices} from 'react-native-vision-camera';
import {Camera} from 'react-native-vision-camera';
import {useScanBarcodes, BarcodeFormat} from 'vision-camera-code-scanner';

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;
  const [scanning, setScanning] = useState(true);
  const scanLineAnimation = useRef(new Animated.Value(0)).current;

  const [frameProcessor, barcodes] = useScanBarcodes(
    [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.CODE_128,
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A,
    ],
    {
      checkInverted: true,
    },
  );

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  useEffect(() => {
    if (scanning && barcodes.length > 0) {
      setScanning(false);
      Alert.alert('Barcode Detected', barcodes[0].displayValue, [
        {
          text: 'OK',
          onPress: () => setScanning(true),
        },
      ]);
    }
  }, [barcodes]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scanLineAnimation]);

  return (
    device != null &&
    hasPermission && (
      <>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={scanning ? frameProcessor : undefined}
          frameProcessorFps={5}
        />
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            {scanning && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLineAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 250],
                        }),
                      },
                    ],
                  },
                ]}
              />
            )}
          </View>
        </View>
      </>
    )
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 5,
    overflow: 'hidden',
  },
  scanLine: {
    height: 2,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
