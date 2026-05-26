import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Image, Dimensions, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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
            body={member?.canEdit ? 'Tap + to add photos by URL. S3 upload coming soon.' : 'Photos from events will appear here.'} />
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

const AddPhotoModal = ({ onClose }: { onClose: () => void }) => {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const m = useMutation({
    mutationFn: () => api.post('/photos', { url, caption: caption || null }),
    onSuccess: () => { Alert.alert('Photo added'); onClose(); },
    onError: (e: any) => Alert.alert('Failed', e.message),
  });
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <Screen bg={T.bg}>
        <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
          <Pressable onPress={onClose}><Ionicons name="close" size={26} color={T.ink} /></Pressable>
          <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Add photo by URL</Text>
        </View>
        <ScrollView style={{ paddingHorizontal: 16 }}>
          <Card>
            <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>IMAGE URL</Text>
            <TextInput value={url} onChangeText={setUrl} placeholder="https://..."
              placeholderTextColor={T.inkFaint} autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink }}
            />
            <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginTop: 12, marginBottom: 4 }}>CAPTION</Text>
            <TextInput value={caption} onChangeText={setCaption}
              placeholderTextColor={T.inkFaint}
              style={{ borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink }}
            />
          </Card>
          <Button label="Add photo" onPress={() => m.mutate()} loading={m.isPending} style={{ marginTop: 16 }} />
          <Text style={{ color: T.inkFaint, fontSize: 12, textAlign: 'center', marginTop: 14 }}>
            Direct upload (S3 / cPanel) coming in a later release.
          </Text>
        </ScrollView>
      </Screen>
    </Modal>
  );
};
