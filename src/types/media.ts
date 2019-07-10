import { Image } from 'data/content/learning/image';
import { Audio } from 'data/content/learning/audio';
import { Video } from 'data/content/learning/video';
import { FileNode } from 'data/content/file_node';
import { ResourceId } from 'data/types';

export type Media = Image | Audio | Video;

export type MediaItem = FileNode;

export type MediaRef = {
  resourceId: ResourceId;
  guid: string;
};
