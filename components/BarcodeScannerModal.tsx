import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (barcode: string, type: string, continuous?: boolean) => void;
  title?: string;
}

export default function BarcodeScannerModal({
  visible,
  onClose,
  onScanned,
  title = "Scan Barcode",
}: BarcodeScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isContinuous, setIsContinuous] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Animate scan line
  React.useEffect(() => {
    if (visible) {
      setScanned(false);
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [visible]);

  const handleBarCodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (scanned) return;
      setScanned(true);
      onScanned(result.data, result.type, isContinuous);

      if (isContinuous) {
        // Reset faster in continuous mode for rapid scanning
        setTimeout(() => setScanned(false), 1000);
      }
    },
    [scanned, onScanned, isContinuous]
  );

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 4],
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {!permission?.granted ? (
          /* Permission Request Screen */
          <View style={styles.permissionContainer}>
            <View style={styles.permissionCard}>
              <Text style={styles.permissionIcon}>📷</Text>
              <Text style={styles.permissionTitle}>Camera Access Required</Text>
              <Text style={styles.permissionText}>
                We need camera access to scan barcodes and QR codes for your products.
              </Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={requestPermission}
                activeOpacity={0.8}
              >
                <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.cancelLink}>
                <Text style={styles.cancelLinkText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Camera Scanner */
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              enableTorch={torch}
              barcodeScannerSettings={{
                barcodeTypes: [
                  "qr",
                  "ean13",
                  "ean8",
                  "upc_a",
                  "code128",
                  "code39",
                  "codabar",
                  "itf14",
                  "upc_e",
                ],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {/* Dark overlay with transparent scan area */}
            <View style={styles.overlay}>
              {/* Top overlay */}
              <View style={styles.overlayTop} />

              {/* Middle row */}
              <View style={styles.overlayMiddle}>
                <View style={styles.overlaySide} />
                
                {/* Scan area */}
                <View style={styles.scanArea}>
                  {/* Corner markers */}
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />

                  {/* Animated scan line */}
                  <Animated.View
                    style={[
                      styles.scanLine,
                      { transform: [{ translateY: scanLineTranslate }] },
                    ]}
                  />
                </View>

                <View style={styles.overlaySide} />
              </View>

              {/* Bottom overlay */}
              <View style={styles.overlayBottom}>
                <Text style={styles.instructionText}>
                  {scanned ? "✅ Barcode Scanned!" : "Position barcode within the frame"}
                </Text>
              </View>
            </View>

            {/* Header bar */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <Text style={styles.headerButtonText}>✕</Text>
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{title}</Text>
                <TouchableOpacity 
                  onPress={() => setIsContinuous(!isContinuous)}
                  style={[styles.modeToggle, isContinuous && styles.modeToggleActive]}
                >
                  <Text style={styles.modeToggleText}>{isContinuous ? "Continuous" : "Single Scan"}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => setTorch(!torch)}
                style={[styles.headerButton, torch && styles.headerButtonActive]}
              >
                <Text style={styles.headerButtonText}>{torch ? "🔦" : "💡"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  modeToggle: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modeToggleActive: {
    backgroundColor: "rgba(99,102,241,0.3)",
    borderColor: "rgba(99,102,241,0.5)",
  },
  modeToggleText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  // Permission styles
  permissionContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  permissionCard: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  permissionTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  cancelLink: {
    marginTop: 20,
    padding: 8,
  },
  cancelLinkText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "600",
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
  },
  // Header
  header: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonActive: {
    backgroundColor: "rgba(59,130,246,0.8)",
  },
  headerButtonText: {
    fontSize: 20,
    color: "#fff",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTop: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  overlayMiddle: {
    flexDirection: "row",
    height: SCAN_AREA_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  overlayBottom: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    paddingTop: 32,
  },
  // Scan area
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderRadius: 4,
    overflow: "hidden",
  },
  scanLine: {
    height: 3,
    backgroundColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  // Corner markers
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#3b82f6",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  // Instruction
  instructionText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
