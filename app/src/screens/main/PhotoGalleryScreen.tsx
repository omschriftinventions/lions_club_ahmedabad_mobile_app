import React, { useMemo, useState } from 'react';
import {
  View, Text, FlatList, Pressable, ActivityIndicator, Image,
  Dimensions, Modal, TextInput, Alert, ScrollView, Linking,
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

const PORTAL_URL = 'https://portal.lions3232b1.org/login';
const { width } = Dimensions.get('window');
const COLS = 2;
const GAP = 8;
const THUMB = (width - 32 - GAP) / COLS;

interface Album { id: number; title: string; cover_url: string | null; photo_count: number; }
interface Photo { id: number; url: string; caption: string | null; created_at: string; }

export default function PhotoGalleryScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { member } = useAuth();
  const [openAlbum, setOpenAlbum] = useState<number | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['albums'], queryFn: () => api.get<{ albums: Album[] }>('/photos/albums') });

  if (openAlbum != null) {
    return <AlbumDetail id={openAlbum} canEdit={!!member?.canEdit} onBack={() => { setOpenAlbum(null); qc.invalidateQueries({ queryKey: ['albums'] }); }} />;
  }

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: T.ink }}>Photo Gallery</Text>
        {member?.canEdit && (
          <Pressable onPress={() => setNewOpen(true)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.brandBlue, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        )}
      </View>

      {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> :
        (data?.albums.length ?? 0) === 0 ? (
          <EmptyState icon="images-outline" title="No albums yet"
            body={member?.canEdit ? 'Tap + to create an album for an event.' : 'Event albums will appear here.'} />
        ) : (
          <FlatList
            data={data?.albums ?? []}
            keyExtractor={a => String(a.id)}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => setOpenAlbum(item.id)}>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  {item.cover_url
                    ? <Image source={{ uri: item.cover_url }} style={{ width: '100%', height: 150, backgroundColor: T.surface }} />
                    : <View style={{ width: '100%', height: 150, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="images-outline" size={40} color={T.inkFaint} /></View>}
                  <View style={{ padding: 12 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: T.ink }}>{item.title}</Text>
                    <Text style={{ fontSize: 12, color: T.inkMute, marginTop: 2 }}>{item.photo_count} photo{item.photo_count === 1 ? '' : 's'}</Text>
                  </View>
                </Card>
              </Pressable>
            )}
          />
        )
      }

      {newOpen && <NewAlbumModal onClose={(id) => { setNewOpen(false); qc.invalidateQueries({ queryKey: ['albums'] }); if (id) setOpenAlbum(id); }} />}
    </Screen>
  );
}

const NewAlbumModal = ({ onClose }: { onClose: (id?: number) => void }) => {
  const [title, setTitle] = useState('');
  const m = useMutation({
    mutationFn: () => api.post<{ id: number }>('/photos/albums', { title: title.trim() }),
    onSuccess: (r) => onClose(r.id),
    onError: (e: any) => Alert.alert('Failed', e.message),
  });
  return (
    <Modal visible animationType="slide" onRequestClose={() => onClose()}>
      <Screen bg={T.bg}>
        <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => onClose()}><Ionicons name="close" size={26} color={T.ink} /></Pressable>
          <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>New album</Text>
        </View>
        <View style={{ paddingHorizontal: 16 }}>
          <Card>
            <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>ALBUM NAME</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Blood Donation Camp – Aug 2026" placeholderTextColor={T.inkFaint}
              style={{ borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink }} />
          </Card>
          <Button label="Create album" onPress={() => m.mutate()} loading={m.isPending} disabled={title.trim().length < 1} style={{ marginTop: 16 }} />
        </View>
      </Screen>
    </Modal>
  );
};

const AlbumDetail = ({ id, canEdit, onBack }: { id: number; canEdit: boolean; onBack: () => void }) => {
  const qc = useQueryClient();
  const [viewing, setViewing] = useState<Photo | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editPresent, setEditPresent] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['album', id], queryFn: () => api.get<{ album: any; photos: Photo[] }>(`/photos/albums/${id}`) });
  const album = data?.album;
  const photos = data?.photos ?? [];

  const del = useMutation({ mutationFn: () => api.delete(`/photos/albums/${id}`), onSuccess: onBack });
  const delPhoto = useMutation({ mutationFn: (pid: number) => api.delete(`/photos/${pid}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['album', id] }) });

  const confirmDelAlbum = () => Alert.alert('Delete album?', 'This removes the album and all its photos.', [
    { text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => del.mutate() },
  ]);

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={onBack}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: T.ink }} numberOfLines={1}>{album?.title ?? 'Album'}</Text>
        {canEdit && <Pressable onPress={confirmDelAlbum} hitSlop={8}><Ionicons name="trash-outline" size={22} color={T.danger} /></Pressable>}
      </View>

      {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> : (
        <FlatList
          data={photos}
          keyExtractor={p => String(p.id)}
          numColumns={COLS}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP, paddingHorizontal: 16 }}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: 16, paddingBottom: 12, gap: 12 }}>
              {canEdit && (
                <Button label="Upload photos" onPress={() => setAddOpen(true)} />
              )}
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: T.ink }}>Members present</Text>
                  {canEdit && <Pressable onPress={() => setEditPresent(true)}><Text style={{ color: T.brandBlue, fontWeight: '700', fontSize: 13 }}>Edit</Text></Pressable>}
                </View>
                {album?.members_present?.length > 0 ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {album.members_present.map((m: any) => (
                      <View key={m.id} style={{ backgroundColor: T.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 12, color: T.inkSoft }}>{m.name}</Text>
                      </View>
                    ))}
                  </View>
                ) : <Text style={{ color: T.inkMute, marginTop: 8, fontSize: 13 }}>No members marked present yet.</Text>}
              </Card>
              {photos.length === 0 && <Text style={{ color: T.inkFaint, textAlign: 'center', marginTop: 16 }}>No photos yet.</Text>}
            </View>
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => setViewing(item)} onLongPress={canEdit ? () => Alert.alert('Delete photo?', '', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => delPhoto.mutate(item.id) }]) : undefined}>
              <Image source={{ uri: item.url }} style={{ width: THUMB, height: THUMB, borderRadius: T.r.md, backgroundColor: T.surface }} />
            </Pressable>
          )}
        />
      )}

      <Modal visible={!!viewing} animationType="fade" transparent onRequestClose={() => setViewing(null)}>
        <Pressable onPress={() => setViewing(null)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' }}>
          {viewing && (
            <>
              <Image source={{ uri: viewing.url }} style={{ width, height: width, resizeMode: 'contain' }} />
              {viewing.caption && <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20, paddingHorizontal: 20 }}>{viewing.caption}</Text>}
            </>
          )}
        </Pressable>
      </Modal>

      {addOpen && <AddPhotoModal albumId={id} onClose={() => { setAddOpen(false); qc.invalidateQueries({ queryKey: ['album', id] }); qc.invalidateQueries({ queryKey: ['albums'] }); }} />}
      {editPresent && <PresentModal albumId={id} current={album?.member_ids || []} onClose={() => { setEditPresent(false); qc.invalidateQueries({ queryKey: ['album', id] }); }} />}
    </Screen>
  );
};

const PresentModal = ({ albumId, current, onClose }: { albumId: number; current: number[]; onClose: () => void }) => {
  const { data } = useQuery({ queryKey: ['roster', 'all'], queryFn: () => api.get<{ members: any[] }>('/members?limit=500') });
  const members = data?.members ?? [];
  const [sel, setSel] = useState<number[]>(current);
  const [q, setQ] = useState('');
  const filtered = useMemo(() => members.filter((m) => m.name.toLowerCase().includes(q.toLowerCase())), [members, q]);
  const toggle = (mid: number) => setSel((s) => s.includes(mid) ? s.filter((x) => x !== mid) : [...s, mid]);
  const save = useMutation({ mutationFn: () => api.patch(`/photos/albums/${albumId}`, { member_ids: sel }), onSuccess: onClose, onError: (e: any) => Alert.alert('Failed', e.message) });
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <Screen bg={T.bg} scroll={false}>
        <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
          <Pressable onPress={onClose}><Ionicons name="close" size={26} color={T.ink} /></Pressable>
          <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: T.ink }}>Members present</Text>
          <Pressable onPress={() => save.mutate()}><Text style={{ color: T.brandBlue, fontWeight: '700' }}>{save.isPending ? 'Saving…' : 'Save'}</Text></Pressable>
        </View>
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <TextInput value={q} onChangeText={setQ} placeholder="Search name…" placeholderTextColor={T.inkFaint}
            style={{ borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink }} />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={m => String(m.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          renderItem={({ item }) => {
            const on = sel.includes(item.id);
            return (
              <Pressable onPress={() => toggle(item.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
                <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? T.brandBlue : T.inkFaint} />
                <Text style={{ flex: 1, color: T.ink }}>{item.name}</Text>
                {item.role_label ? <Text style={{ color: T.inkMute, fontSize: 12 }}>{item.role_label}</Text> : null}
              </Pressable>
            );
          }}
        />
      </Screen>
    </Modal>
  );
};

interface PickedAsset { uri: string; base64: string; mimeType: string; }

const AddPhotoModal = ({ albumId, onClose }: { albumId: number; onClose: () => void }) => {
  const [picked, setPicked] = useState<PickedAsset | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);

  const m = useMutation({
    mutationFn: async () => {
      if (!picked) throw new Error('Pick a photo first');
      const file = `data:${picked.mimeType};base64,${picked.base64}`;
      return api.post('/photos/upload', { file, caption: caption || null, album_id: albumId });
    },
    onSuccess: () => {
      Alert.alert('Photo uploaded', 'Also upload to the District portal?', [
        { text: 'Not now', style: 'cancel', onPress: onClose },
        { text: 'Open portal', onPress: () => { Linking.openURL(PORTAL_URL).catch(() => {}); onClose(); } },
      ]);
    },
    onError: (e: any) => Alert.alert('Failed', e.message),
  });

  const pick = async (fromCamera: boolean) => {
    setBusy(true);
    try {
      if (fromCamera) {
        const cam = await ImagePicker.requestCameraPermissionsAsync();
        if (!cam.granted) { Alert.alert('Permission needed', 'Camera access is required.'); return; }
      } else {
        const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!lib.granted) { Alert.alert('Permission needed', 'Photo library access is required.'); return; }
      }
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true, exif: false })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true, exif: false });
      const asset = result.assets?.[0];
      if (!asset || !asset.base64) return;
      setPicked({ uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType ?? 'image/jpeg' });
    } catch (e: any) {
      Alert.alert('Could not pick photo', e?.message ?? 'Try again.');
    } finally { setBusy(false); }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <Screen bg={T.bg}>
        <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
          <Pressable onPress={onClose}><Ionicons name="close" size={26} color={T.ink} /></Pressable>
          <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Upload photo</Text>
        </View>
        <ScrollView style={{ paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
          <Card>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable onPress={() => pick(false)} disabled={busy} style={{ flex: 1, alignItems: 'center', paddingVertical: 18, borderRadius: T.r.sm, borderWidth: 1, borderColor: T.line, backgroundColor: T.bg }}>
                <Ionicons name="images-outline" size={26} color={T.brandBlue} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: T.ink, marginTop: 8 }}>Library</Text>
              </Pressable>
              <Pressable onPress={() => pick(true)} disabled={busy} style={{ flex: 1, alignItems: 'center', paddingVertical: 18, borderRadius: T.r.sm, borderWidth: 1, borderColor: T.line, backgroundColor: T.bg }}>
                <Ionicons name="camera-outline" size={26} color={T.brandBlue} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: T.ink, marginTop: 8 }}>Camera</Text>
              </Pressable>
            </View>
            {picked && (
              <View style={{ marginTop: 14, alignItems: 'center' }}>
                <Image source={{ uri: picked.uri }} style={{ width: 160, height: 160, borderRadius: T.r.md, backgroundColor: T.surface }} />
                <Pressable onPress={() => setPicked(null)} style={{ marginTop: 10 }}><Text style={{ color: T.danger, fontSize: 13, fontWeight: '600' }}>Remove</Text></Pressable>
              </View>
            )}
            {busy && <ActivityIndicator color={T.brandBlue} style={{ marginTop: 14 }} />}
          </Card>
          <Card style={{ marginTop: 14 }}>
            <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>CAPTION (OPTIONAL)</Text>
            <TextInput value={caption} onChangeText={setCaption} placeholderTextColor={T.inkFaint}
              style={{ borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink }} />
          </Card>
          <Button label="Upload photo" onPress={() => m.mutate()} loading={m.isPending || busy} disabled={!picked} style={{ marginTop: 16 }} />
        </ScrollView>
      </Screen>
    </Modal>
  );
};
