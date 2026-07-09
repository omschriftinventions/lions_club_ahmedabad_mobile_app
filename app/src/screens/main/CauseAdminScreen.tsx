import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Modal, Alert, StyleSheet } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';

interface Cause { id: string; name: string; icon: string; unit_label: string | null; color: string; sort_order: number; }

const ICONS = [
  '👁️', '👓', '🩺', '👂', '🧠',
  '🍱', '🍎', '🥖', '🍲', '🥗',
  '🌳', '🌱', '🌍', '♻️', '🌊', '🪴',
  '💉', '🩸', '🧪', '💊', '🦷', '❤️', '🩹', '🧑‍⚕️',
  '🎗️', '❤️‍🩹', '🏥', '🚨', '🆘', '🛟',
  '💧', '🚰', '📚', '✏️', '🎓', '📝', '🎒', '📖',
  '🧒', '🧸', '🎈', '⚽', '🎨', '🎸', '🧩',
  '🤝', '🏘️', '🙌', '🏠', '👴', '👵', '🐕', '🐾',
];

const COLORS = [
  '#003F87', '#2A6FDB', '#0EA5E9', '#0891B2', '#1F8A5B', '#059669', '#65A30D',
  '#E08E1A', '#CA8A04', '#EA580C', '#C8362D', '#DC2626', '#E11D48', '#DB2777',
  '#7A3FB8', '#7C3AED', '#9333EA', '#4F46E5',
];

export default function CauseAdminScreen() {
  const nav = useNavigation<any>();
  const { member } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Cause | null>(null);
  const [creating, setCreating] = useState(false);

  const list = useQuery({ queryKey: ['causes'], queryFn: () => api.get<{ causes: Cause[] }>('/causes') });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/causes/${encodeURIComponent(id)}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['causes'] }),
    onError: (e: any) => Alert.alert('Could not delete', e.message),
  });

  const remove = (c: Cause) => {
    Alert.alert('Delete cause', `Delete "${c.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => del.mutate(c.id) },
    ]);
  };

  if (!member?.superAdmin) {
    return (
      <Screen bg={T.bg}>
        <View style={{ padding: 16, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Ionicons name="lock-closed" size={40} color={T.inkMute} />
          <Text style={{ marginTop: 12, fontWeight: '700', color: T.ink }}>Super admin access required</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen bg={T.bg}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: T.ink }}>Causes</Text>
        <Pressable onPress={() => setCreating(true)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.brandGold, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="add" size={20} color={T.ink} />
        </Pressable>
      </View>

      <ScrollView style={{ paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={{ color: T.inkMute, fontSize: 13, marginBottom: 12 }}>
          Global service causes used when logging projects. New causes appear in the Log project picker immediately.
        </Text>

        {list.isLoading ? <ActivityIndicator color={T.brandBlue} /> :
          (list.data?.causes.length ?? 0) === 0 ? (
            <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
              <Ionicons name="heart-outline" size={34} color={T.inkFaint} />
              <Text style={{ marginTop: 10, fontWeight: '700', color: T.ink }}>No causes yet</Text>
              <Text style={{ color: T.inkMute, fontSize: 13, marginTop: 4 }}>Add your first cause to start tracking impact.</Text>
            </Card>
          ) : (list.data!.causes.map((c) => (
            <Card key={c.id} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${c.color}22`, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 24 }}>{c.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: T.ink, fontSize: 15 }}>{c.name}</Text>
                  <Text style={{ color: T.inkMute, fontSize: 12, marginTop: 2 }}>{c.unit_label || '—'}  ·  {c.id}</Text>
                </View>
                <View style={{ width: 18, height: 18, borderRadius: 6, backgroundColor: c.color, borderWidth: 1, borderColor: T.line }} />
                <Pressable onPress={() => setEditing(c)} style={{ padding: 8 }}><Ionicons name="create-outline" size={18} color={T.brandBlue} /></Pressable>
                <Pressable onPress={() => remove(c)} style={{ padding: 8 }}><Ionicons name="trash-outline" size={18} color={T.danger} /></Pressable>
              </View>
            </Card>
          )))}
      </ScrollView>

      {(creating || editing) && (
        <CauseModal cause={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); qc.invalidateQueries({ queryKey: ['causes'] }); qc.invalidateQueries({ queryKey: ['impact'] }); }} />
      )}
    </Screen>
  );
}

const CauseModal: React.FC<{ cause: Cause | null; onClose: () => void; onSaved: () => void }> = ({ cause, onClose, onSaved }) => {
  const [name, setName] = useState(cause?.name ?? '');
  const [id, setId] = useState(cause?.id ?? '');
  const [icon, setIcon] = useState(cause?.icon ?? ICONS[0]);
  const [color, setColor] = useState(cause?.color ?? COLORS[0]);
  const [unitLabel, setUnitLabel] = useState(cause?.unit_label ?? '');
  const [sortOrder, setSortOrder] = useState(String(cause?.sort_order ?? ''));
  const [err, setErr] = useState('');

  const m = useMutation({
    mutationFn: async () => {
      const body = {
        name: name.trim(),
        icon,
        color,
        unit_label: unitLabel.trim() || null,
        sort_order: Number(sortOrder) || undefined,
        ...(cause ? {} : { id: id.trim() || undefined }),
      };
      if (cause) return api.put(`/causes/${encodeURIComponent(cause.id)}`, body);
      return api.post('/causes', body);
    },
    onSuccess: onSaved,
    onError: (e: any) => setErr(e.message || 'Could not save cause'),
  });

  const field = (label: string, val: string, set: (s: string) => void, opts: { numeric?: boolean; hint?: string } = {}) => (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>{label.toUpperCase()}</Text>
      <TextInput
        value={val}
        onChangeText={set}
        placeholder={opts.hint}
        placeholderTextColor={T.inkFaint}
        keyboardType={opts.numeric ? 'numeric' : 'default'}
        style={styles.input}
      />
    </View>
  );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.mask}>
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>{cause ? 'Edit cause' : 'Add cause'}</Text>
            <Pressable onPress={onClose}><Ionicons name="close" size={24} color={T.inkMute} /></Pressable>
          </View>

          <ScrollView style={{ maxHeight: 420 }}>
            {field('Name', name, setName, { hint: 'e.g. Vision' })}
            {!cause && field('Slug (optional)', id, (v: string) => setId(v.toLowerCase()), { hint: 'e.g. vision' })}
            {field('Unit label (optional)', unitLabel, setUnitLabel, { hint: 'e.g. people served' })}
            {field('Sort order (optional)', sortOrder, setSortOrder, { numeric: true, hint: '10' })}

            <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginTop: 16, marginBottom: 6 }}>ICON</Text>
            <View style={styles.iconGrid}>
              {ICONS.map((ic) => (
                <Pressable key={ic} onPress={() => setIcon(ic)} style={[styles.iconCell, icon === ic && { borderColor: T.brandBlue, backgroundColor: '#E0EBFF' }]}>
                  <Text style={{ fontSize: 22 }}>{ic}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={{ color: T.inkMute, fontSize: 11, letterSpacing: 0.5, marginTop: 16, marginBottom: 8 }}>COLOR</Text>
            <View style={styles.colorRow}>
              {COLORS.map((col) => (
                <Pressable key={col} onPress={() => setColor(col)} style={[styles.colorCell, { backgroundColor: col }, color === col && { borderWidth: 3, borderColor: T.ink }]} />
              ))}
            </View>

            {err ? <Text style={{ color: T.danger, fontSize: 13, marginTop: 12 }}>{err}</Text> : null}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <Button label="Cancel" variant="outline" onPress={onClose} />
            <Button label={m.isPending ? 'Saving...' : 'Save cause'} onPress={() => m.mutate()} loading={m.isPending} disabled={name.trim().length < 2} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: T.line, borderRadius: T.r.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink },
  mask: { flex: 1, backgroundColor: 'rgba(10,18,35,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: T.surface, borderTopLeftRadius: T.r.xl, borderTopRightRadius: T.r.xl, padding: 20, paddingBottom: 28 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  iconCell: { width: 44, height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorCell: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: T.line },
});
