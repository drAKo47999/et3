import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Zap,
  Gamepad2,
  HeartPulse,
  Sparkles,
  Plane,
  BookOpen,
  Coffee,
  Fuel,
  GraduationCap,
  Shirt,
  Smartphone,
  Tv,
  Gift,
  Briefcase,
  Wifi,
  Film,
  Music,
  Dumbbell,
  Dog,
  Scissors,
  Hammer,
  CircleDot,
  DollarSign,
  LucideProps,
} from 'lucide-react';

export const ICON_OPTIONS: { name: string; component: React.ComponentType<LucideProps> }[] = [
  { name: 'Utensils', component: Utensils },
  { name: 'ShoppingBag', component: ShoppingBag },
  { name: 'Car', component: Car },
  { name: 'Home', component: Home },
  { name: 'Zap', component: Zap },
  { name: 'Gamepad2', component: Gamepad2 },
  { name: 'HeartPulse', component: HeartPulse },
  { name: 'Sparkles', component: Sparkles },
  { name: 'Plane', component: Plane },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Coffee', component: Coffee },
  { name: 'Fuel', component: Fuel },
  { name: 'GraduationCap', component: GraduationCap },
  { name: 'Shirt', component: Shirt },
  { name: 'Smartphone', component: Smartphone },
  { name: 'Tv', component: Tv },
  { name: 'Gift', component: Gift },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Wifi', component: Wifi },
  { name: 'Film', component: Film },
  { name: 'Music', component: Music },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Dog', component: Dog },
  { name: 'Scissors', component: Scissors },
  { name: 'Hammer', component: Hammer },
  { name: 'DollarSign', component: DollarSign },
  { name: 'CircleDot', component: CircleDot },
];

export const CategoryIcon: React.FC<{
  name: string;
  className?: string;
  size?: number;
}> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  const match = ICON_OPTIONS.find((item) => item.name.toLowerCase() === name.toLowerCase());
  const IconComponent = match ? match.component : CircleDot;
  return <IconComponent className={className} size={size} />;
};
