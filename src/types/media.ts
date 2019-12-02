import { Image } from 'data/content/learning/image';
import { Audio } from 'data/content/learning/audio';
import { Video } from 'data/content/learning/video';
import { IFrame } from 'data/content/learning/iframe';
import { FileNode } from 'data/content/file_node';

export type Media = Image | Audio | Video | IFrame;

export type MediaItem = FileNode;

export type MediaRef = {
  resourceId: string;
  guid: string;
};
