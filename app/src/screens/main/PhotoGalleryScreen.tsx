import React, { useState } from 'react';
import {
  View, Text, FlatList, Pressable, ActivityIndicator, Image,
  Dimensions, Modal, TextInput, Alert, ScrollView, Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

const { width } = Dimensions.get('window');
const COLS = 2;
const GAP = 8;
const THUMB = (width - 32 - GAP) / COLS;

interface Photo { id: number; url: string; caption: string | null; taken_at: string | null; created_at: string; }

export default function PhotoGalleryScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { member } = useAuth();
  const [viewing, setViewing] = useState<Photo | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['photos'],
    queryFn: () => api.get<{ photos: Photo[] }>('/photos?limit=200'),
  });

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: T.ink }}>Photo Gallery</Text>
        {member?.canEdit && (
          <Pressable onPress={() => setAddOpen(true)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.brandBlue, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        )}
      </View>

      {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> :
        (data?.photos.length ?? 0) === 0 ? (
          <EmptyState icon="images-outline" title="No photos yet"
            body={member?.canEdit ? 'Tap + to upload photos from your phone.' : 'Photos from events will appear here.'} />
        ) : (
          <FlatList
            data={data?.photos ?? []}
            keyExtractor={p => String(p.id)}
            numColumns={COLS}
            columnWrapperStyle={{ gap: GAP, marginBottom: GAP, paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => setViewing(item)}>
                <Image source={{ uri: item.url }} style={{ width: THUMB, height: THUMB, borderRadius: T.r.md, backgroundColor: T.surface }} />
                {item.caption && (
                  <Text numberOfLines={1} style={{ fontSize: 11, color: T.inkMute, marginTop: 4, width: THUMB }}>{item.caption}</Text>
                )}
              </Pressable>
            )}
          />
        )
      }

      <Modal visible={!!viewing} animationType="fade" transparent onRequestClose={() => setViewing(null)}>
        <Pressable onPress={() => setViewing(null)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' }}>
          {viewing && (
            <>
              <Image source={{ uri: viewing.url }} style={{ width: width, height: width, resizeMode: 'contain' }} />
              {viewing.caption && (
                <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20, paddingHorizontal: 20 }}>{viewing.caption}</Text>
              )}
            </>
          )}
        </Pressable>
      </Modal>

      {addOpen && <AddPhotoModal onClose={() => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['photos'] }); }} />}
    </Screen>
  );
}

interface PickedAsset { uri: string; base64: string; mimeType: string; }

const AddPhotoModal = ({ onClose }: { onClose: () => void }) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [picked, setPicked] = useState<PickedAsset | null>(null);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);

  const m = useMutation({
    mutationFn: async () => {
      if (mode === 'upload') {
        if (!picked) throw new Error('Pick a photo first');
        const file = `data:${picked.mimeType};base64,${picked.base64}`;
        return api.post('/photos/upload', { file, caption: caption || null });
      }
      if (!url.trim()) throw new Error('Enter an image URL');
      return api.post('/photos', { url: url.trim(), caption: caption || null });
    },
    onSuccess: () => { Alert.alert('Photo added'); onClose(); },
    onError: (e: any) => Alert.alert('Failed', e.message),
  });

  const pick = async (fromCamera: boolean) => {
    setBusy(true);
    try {
      if (fromCamera) {
        const cam = await ImagePicker.requestCameraPermissionsAsync();
        if (!cam.granted) { Alert.alert('Permission needed', 'Camera access is required to take a photo.'); return; }
      } else {
        const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!lib.granted) { Alert.alert('Permission needed', 'Photo library access is required to pick a photo.'); return; }
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
            exif: false,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
            exif: false,
          });

      const asset = result.assets?.[0];
      if (!asset || !asset.base64) return;
      setPicked({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType ?? 'image/jpeg',
      });
    } catch (e: any) {
      Alert.alert('Could not pick photo', e?.message ?? 'Try again.');
    } finally {
      setBusy(false);
    }
  };

  const SegBtn = ({ id, label, icon }: { id: 'upload' | 'url'; label: string; icon: any }) => (
    <Pressable
      onPress={() => setMode(id)}
      style={{
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        paddingVertical: 10, borderRadius: T.r.sm,
        backgroundColor: mode === id ? T.brandBlue : T.bg,
        borderWidth: 1, borderColor: mode === id ? T.brandBlue : T.line,
      }}>
      <Ionicons name={icon} size={16} color={mode === id ? '#fff' : T.inkMute} />
      <Text style={{ fontSize: 13, fontWeight: '700', color: mode === id ? '#fff' : T.inkMute }}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <Screen bg={T.bg}>
        <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
          <Pressable onPress={onClose}><Ionicons name="close" size={26} color={T.ink} /></Pressable>
          <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Add photo</Text>
        </View>

        <ScrollView style={{ paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <SegBtn id="upload" label="Upload" icon="cloud-upload" />
            <SegBtn id="url" label="Paste URL" icon="link" />
          </View>

          {mode === 'upload' ? (
            <Card>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                  onPress={() => pick(false)}
                  disabled={busy}
                  style={{ flex: 1, alignItems: 'center', paddingVertical: 18, borderRadius: T.r.sm, borderWidth: 1, borderColor: T.line, backgroundColor: T.bg }}>
                  <Ionicons name="images-outline" size={26} color={T.brandBlue} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: T.ink, marginTop: 8 }}>Library</Text>
                </Pressable>
                <Pressable
                  onPress={() => pick(true)}
                  disabled={busy}
                  style={{ flex: 1, alignItems: 'center', paddingVertical: 18, borderRadius: T.r.sm, borderWidth: 1, borderColor: T.line, backgroundColor: T.bg }}>
                  <Ionicons name="camera-outline" size={26} color={T.brandBlue} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: T.ink, marginTop: 8 }}>Camera</Text>
                </Pressable>
              </View>

              {picked && (
                <View style={{ marginTop: 14, alignItems: 'center' }}>
                  <Image source={{ uri: picked.uri }} style={{ width: 160, height: 160, borderRadius: T.r.md, backgroundColor: T.surface }} />
                  <Pressable onPress={() => setPicked(null)} style={{ marginTop: 10 }}>
                    <Text style={{ color: T.danger, fontSize: 13, fontWeight: '600' }}>Remove</Text>
                  </Pressable>
                </View>
              )}
              {busy && <ActivityIndicator color={T.brandBlue} style={{ marginTop: 14 }} />}
            </Card>
          ) : (
            <Card>
              <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>IMAGE URL</Text>
              <TextInput value={url} onChangeText={setUrl} placeholder="https://..."
                placeholderTextColor={T.inkFaint} autoCapitalize="none"
                style={{ borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink }}
              />
            </Card>
          )}

          <Card style={{ marginTop: 14 }}>
            <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>CAPTION (OPTIONAL)</Text>
            <TextInput value={caption} onChangeText={setCaption}
              placeholderTextColor={T.inkFaint}
              style={{ borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink }}
            />
          </Card>

          <Button label="Add photo" onPress={() => m.mutate()} loading={m.isPending || busy} style={{ marginTop: 16 }} />

          <Text style={{ color: T.inkFaint, fontSize: 12, textAlign: 'center', marginTop: 14 }}>
            {Platform.OS === 'web'
              ? 'Upload is available on the mobile app.'
              : 'Images are stored on the club server. Max 8 MB, JPG/PNG/WebP.'}
          </Text>
        </ScrollView>
      </Screen>
    </Modal>
  );
};
