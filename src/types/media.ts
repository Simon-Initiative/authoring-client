import { Image } from 'data/content/html/image';
import { Audio } from 'data/content/html/audio';
import { Video } from 'data/content/html/video';
import { FileNode } from 'data/content/file_node';

export type Media = Image | Audio | Video;

export type MediaItem = FileNode;
