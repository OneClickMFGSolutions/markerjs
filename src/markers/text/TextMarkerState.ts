import { MarkerBaseState } from '../MarkerBaseState';

export interface TextMarkerState extends MarkerBaseState {
  text: string;
  shadowX?: number
  shadowY?: number
  shadowBlur?: number
  shadowColor?: string
}