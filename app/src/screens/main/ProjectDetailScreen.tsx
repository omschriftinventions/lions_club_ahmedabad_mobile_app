import React from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../lib/api';
import { T } from '../../theme/tokens';

const { width } = Dimensions.get('window');
const COLS = 3;
const GAP = 6;
const THUMB = (width - 32 - GAP * (COLS - 1)) / COLS;

interface Photo { id: number; url: string; caption: string | null; taken_at: string | null; }

export default function ProjectDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const id = route.params?.id as number | undefined;
  const causeId = route.params?.causeId as string | undefined;

  // List service_projects (server route returns list, no single GET — filter client-side)
  const projects = useQuery({
    queryKey: ['service-projects', causeId ?? 'all'],
    queryFn: () => api.get<{ projects: any[] }>(causeId ? `/service-projects?cause_id=${causeId}` : `/service-projects`),
  });

  const project = projects.data?.projects.find(p => p.id === id) ?? projects.data?.projects[0];

  const photos = useQuery({
    queryKey: ['photos', 'project', project?.id],
    queryFn: () => api.get<{ photos: Photo[] }>(`/photos?project_id=${project!.id}`),
    enabled: !!project?.id,
  });

  if (projects.isLoading) return <Screen><ActivityIndicator color={T.brandBlue} style={{ marginTop: 40 }} /></Screen>;
  if (!project) return <Screen><EmptyState icon="folder-open-outline" title="Project not found" /></Screen>;

  return (
    <Screen bg={T.bgWarm}>
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => nav.goBack()}><Ionicons name="chevron-back" size={26} color={T.ink} /></Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>Project</Text>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <Pill label={project.cause_id ?? 'Service'} color={T.success} />
        <Text style={{ marginTop: 10, fontSize: 24, fontWeight: '800', color: T.ink, letterSpacing: -0.4 }}>{project.title}</Text>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
          <Stat label="Units"    value={String(project.units ?? 0)} />
          <Stat label="₹ Spent"  value={`₹${Number(project.amount_inr ?? 0).toLocaleString('en-IN')}`} />
          {project.occurred_on && <Stat label="When"   value={new Date(project.occurred_on).toLocaleDateString()} />}
        </View>

        {project.notes && (
          <Card style={{ marginTop: 14 }}>
            <Text style={{ color: T.inkSoft, lineHeight: 20 }}>{project.notes}</Text>
          </Card>
        )}

        <Text style={{ marginTop: 22, fontWeight: '700', color: T.ink, fontSize: 15 }}>Gallery</Text>
        {photos.isLoading ? <ActivityIndicator color={T.brandBlue} style={{ marginTop: 16 }} /> :
          (photos.data?.photos.length ?? 0) === 0 ? (
            <Text style={{ marginTop: 10, color: T.inkMute, fontSize: 13 }}>No photos yet for this project.</Text>
          ) : (
            <FlatList
              data={photos.data?.photos ?? []}
              keyExtractor={p => String(p.id)}
              numColumns={COLS}
              scrollEnabled={false}
              columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
              style={{ marginTop: 12 }}
              renderItem={({ item }) => (
                <Image source={{ uri: item.url }} style={{ width: THUMB, height: THUMB, borderRadius: T.r.sm, backgroundColor: T.bg }} />
              )}
            />
          )
        }
      </View>
    </Screen>
  );
}

const Stat = ({ label, value }: any) => (
  <View style={{ flex: 1, backgroundColor: T.surface, borderRadius: T.r.md, padding: 12 }}>
    <Text style={{ fontSize: 10, fontWeight: '800', color: T.inkMute, letterSpacing: 1 }}>{label.toUpperCase()}</Text>
    <Text style={{ marginTop: 4, fontSize: 18, fontWeight: '800', color: T.ink }}>{value}</Text>
  </View>
);
