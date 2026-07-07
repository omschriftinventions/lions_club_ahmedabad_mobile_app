import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Alert, ActivityIndicator, Modal, Image } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../../components/Screen';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

interface Member {
  id: number; name: string; initials: string; role: string;
  role_label: string; role_color: string; avatar_color: string | null;
  avatar_url: string | null; profession: string | null; phone: string | null;
}

export default function RosterAdminScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { member } = useAuth();
  const [q, setQ] = useState('');
  const [manageFor, setManageFor] = useState<Member | null>(null);
  const [pwVal, setPwVal] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!member?.canEdit) {
    return (
      <Screen><View style={{ padding: 24 }}>
        <Text style={{ color: T.danger, fontWeight: '700' }}>Forbidden</Text>
        <Text style={{ color: T.inkMute, marginTop: 6 }}>Officer access required.</Text>
      </View></Screen>
    );
  }

  const { data, isLoading } = useQuery({
    queryKey: ['members', 'admin', q],
    queryFn: () => api.get<{ members: Member[] }>(`/members?search=${encodeURIComponent(q)}`),
  });
  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/members/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
  const setPw = useMutation({
    mutationFn: () => api.post(`/admin/members/${manageFor!.id}/password`, { password: pwVal }),
    onSuccess: () => { Alert.alert('Password updated'); setPwVal(''); },
    onError: (e: any) => Alert.alert('Failed', e.message),
  });

  const pickAvatar = async () => {
    if (!manageFor) return;
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true });
      const asset = res.assets?.[0];
      if (!asset?.base64) return;
      setUploading(true);
      try {
        const r = await api.post<{ url: string }>(`/admin/members/${manageFor.id}/avatar`, { file: `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}` });
        setAvatarUrl(r.url);
        Alert.alert('Photo updated');
      } catch (e: any) { Alert.alert('Upload failed', e?.message); } finally { setUploading(false); }
    } catch (e: any) { Alert.alert('Could not pick photo', e?.message); }
  };

  const openManage = (m: Member) => {
    setManageFor(m);
    setPwVal('');
    setAvatarUrl(m.avatar_url ?? '');
  };

  const closeManage = () => {
    setManageFor(null);
    setPwVal('');
    qc.invalidateQueries({ queryKey: ['members'] });
  };

  const confirmDelete = (m: Member) => {
    Alert.alert('Remove member?', `${m.name} will be hidden from the directory.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => del.mutate(m.id) },
    ]);
  };

  return (
    <Screen bg={T.bg} scroll={false}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: T.ink }}>Manage members</Text>
        <Pressable onPress={() => nav.navigate('AddMember')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.brandBlue, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderRadius: T.r.md, paddingHorizontal: 12, height: 42, borderWidth: 1, borderColor: T.line }}>
          <Ionicons name="search" size={16} color={T.inkMute} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search" placeholderTextColor={T.inkFaint} style={{ flex: 1, marginLeft: 8, fontSize: 14, color: T.ink }} />
        </View>
      </View>
      {isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 30 }} /> : (
        <FlatList
          data={data?.members ?? []}
          keyExtractor={m => String(m.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', backgroundColor: T.surface, padding: 12, borderRadius: T.r.md, marginBottom: 8, alignItems: 'center', gap: 12 }}>
              <Avatar initials={item.initials} color={item.avatar_color ?? item.role_color} size={42} uri={item.avatar_url} />
              <Pressable style={{ flex: 1 }} onPress={() => nav.navigate('MemberDetail', { id: item.id })}>
                <Text style={{ fontWeight: '700', color: T.ink }} numberOfLines={1}>{item.name}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}><Pill label={item.role_label} color={item.role_color} /></View>
                {item.phone && <Text style={{ color: T.inkMute, fontSize: 12, marginTop: 4 }} numberOfLines={1}>{item.phone}</Text>}
              </Pressable>
              {member?.superAdmin && (
                <Pressable onPress={() => openManage(item)} hitSlop={12} style={{ padding: 6 }}>
                  <Ionicons name="key-outline" size={20} color={T.brandBlue} />
                </Pressable>
              )}
              <Pressable onPress={() => confirmDelete(item)} hitSlop={12} style={{ padding: 6 }}>
                <Ionicons name="trash-outline" size={20} color={T.danger} />
              </Pressable>
            </View>
          )}
        />
      )}

      {/* Manage Member Modal (super admin only) — Set photo + Set password */}
      <Modal visible={!!manageFor} transparent animationType="fade" onRequestClose={closeManage}>
        <Pressable onPress={closeManage} style={{ flex: 1, backgroundColor: 'rgba(10,18,35,0.5)', justifyContent: 'center', padding: 24 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: T.surface, borderRadius: T.r.lg, padding: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: T.ink, marginBottom: 16 }}>Manage \u00b7 {manageFor?.name}</Text>

            {/* Photo section */}
            <Text style={{ fontSize: 11, fontWeight: '800', color: T.inkMute, letterSpacing: 1, marginBottom: 10 }}>PROFILE PHOTO</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: T.surface }} />
              ) : (
                <Avatar initials={manageFor?.initials ?? '?'} color={manageFor?.avatar_color ?? T.brandBlue} size={64} />
              )}
              <View style={{ flex: 1 }}>
                <Pressable onPress={pickAvatar} disabled={uploading} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="camera" size={16} color={T.brandBlue} />
                  <Text style={{ color: T.brandBlue, fontWeight: '700' }}>{uploading ? 'Uploading...' : 'Change photo'}</Text>
                </Pressable>
                <Text style={{ color: T.inkFaint, fontSize: 11, marginTop: 4 }}>JPG/PNG/WebP, up to 4 MB</Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: T.line, marginBottom: 16 }} />

            {/* Password section */}
            <Text style={{ fontSize: 11, fontWeight: '800', color: T.inkMute, letterSpacing: 1, marginBottom: 8 }}>PASSWORD</Text>
            <TextInput
              value={pwVal} onChangeText={setPwVal} placeholder="New password (min 6)"
              placeholderTextColor={T.inkFaint}
              style={{ borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink }}
            />
            <Button label={setPw.isPending ? 'Saving...' : 'Save password'} onPress={() => setPw.mutate()} loading={setPw.isPending} style={{ marginTop: 12 }} />

            <Pressable onPress={closeManage} style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={{ color: T.inkMute, fontWeight: '600' }}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}