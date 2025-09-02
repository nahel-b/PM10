import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, Dimensions, Platform, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import PersonasAvatar from './avatar/src/personas-avatar';
import { combineCharacters, DEFAULT_CHARACTERS, parseCharacters } from './avatar/src/utils';
// Avatar constants (values and colors)
import { hairColors, hairs } from './avatar/src/constants/hair';
import { eyeses } from './avatar/src/constants/eyes';
import mouths from './avatar/src/constants/mouth';
import noses from './avatar/src/constants/nose';
import { bodyColors, bodies } from './avatar/src/constants/body';
import { facialHairColors, facialHairs } from './avatar/src/constants/facial-hair';
import { skinColors } from './avatar/src/constants/skin';
// Preview components (rendered inside a tiny Svg)
import Svg from 'react-native-svg';
import Hair from './avatar/src/components/hair';
import Eyes from './avatar/src/components/eyes';
import Mouth from './avatar/src/components/mouth';
import Nose from './avatar/src/components/nose';
import Body from './avatar/src/components/body';
import FacialHair from './avatar/src/components/facial-hair';
import { backgroundColors } from './avatar/src/constants/background';

import {getDeviceCornerRadius} from './Utils';

import Entypo from 'react-native-vector-icons/Entypo';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';

import { useRestaurant } from './context/RestaurantsContext';
import BouncyAppear from './components/BouncyAppear';
import Sparkles from './components/Sparkles';

import * as Haptics from 'expo-haptics';

import { useNavigation } from '@react-navigation/native';
 

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');




const AvatarCreationView = () => {

    const { avatar, saveAvatar } = useRestaurant();
    
  const avatarRef = useRef(null);

  const [internalCharacters, setCharacters] = useState(
    avatar ? parseCharacters(avatar) : null
  );

    const navigation = useNavigation();
  
  
  useEffect(() => {
    console.log("avatar from context", avatar);
    if (avatar === null || avatar === undefined) {
     // avatarRef.current?.randomize?.();
     console.log("reset charrr");
      setCharacters(null);
    } 
    else {
      const parsed = parseCharacters(avatar);
      setCharacters(parsed);
      avatarRef.current?.setCharacters?.(parsed);
    }
  }, [avatar]);

  



  const [modalVisible, setModalVisible] = useState(false);
  const sparklesRef = useRef(null);
  const lastBeforeModalRef = useRef(null);
  const [activeKey, setActiveKey] = useState(null); 


  const CONFIG = useMemo(
    () => ({
      hair: {
        label: 'Cheveux',
        valueKey: 'hair',
        values: Object.keys(hairs),
        colorKey: 'hairColor',
  colors: hairColors,
      },
      eyes: {
        label: 'Yeux',
        valueKey: 'eyes',
        values: Object.keys(eyeses),
      },
      skinColor: {
        label: 'Peau',
        colorKey: 'skinColor',
        colors: skinColors,
      },
      body: {
        label: 'Corps',
        valueKey: 'body',
        values: Object.keys(bodies),
        colorKey: 'bodyColor',
        colors: bodyColors,
      },
      mouth: {
        label: 'Bouche',
        valueKey: 'mouth',
        values: Object.keys(mouths),
      },
      facialHair: {
        label: 'Barbe',
        valueKey: 'facialHair',
        values: Object.keys(facialHairs),
        colorKey: 'facialHairColor',
        colors: facialHairColors,
      },
      nose: {
        label: 'Nez',
        valueKey: 'nose',
        values: Object.keys(noses),
      },
      backgroundColors: {
        label: 'Arrière-plan',
        colorKey: 'backgroundColor',
        colors: backgroundColors,
      },
      
    }),
    []
  );

  

  const openModal = (key) => {
    setActiveKey(key);
    // Snapshot values before opening
    lastBeforeModalRef.current = { ...internalCharacters };
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
    // If something changed, burst sparkles on avatar
    const before = lastBeforeModalRef.current;
    if (before) {
      const after = internalCharacters;
      const changed = Object.keys(after).some((k) => before[k] !== after[k]);
      if (changed) {
        // small delay to ensure modal starts closing
        setTimeout(() => {
          sparklesRef.current?.burst?.({maxRadius : 400, duration : 600, particleCount : 90});
        }, 120);
      }
    }
  };


  const cycleValue = (key, direction) => {
    const cfg = CONFIG[key];
    if (!cfg || !cfg.values) return;
    const list = cfg.values;
    const current = internalCharacters[cfg.valueKey];
    const idx = Math.max(0, list.indexOf(current));
    const next = list[(idx + direction + list.length) % list.length];
    setCharacters((prev) => ({ ...prev, [cfg.valueKey]: next }));
  };

  // Color select helper
  const selectColor = (key, colorKeyValue) => {
    const cfg = CONFIG[key];
    if (!cfg || !cfg.colorKey) return;
    setCharacters((prev) => ({ ...prev, [cfg.colorKey]: colorKeyValue }));
  };

  const characteristicOrder = ['hair', 'eyes', 'skinColor', 'body', 'mouth', 'facialHair', 'nose','backgroundColors'];

  // useEffect(() => {
  //   // Ensure initial values are valid (keep defaults)
  //   setCharacters((prev) => ({ ...prev }));
  // }, []);

    const saveAvatarButton = () => {
        saveAvatar(combineCharacters(internalCharacters));
        Haptics.notificationAsync( Haptics.NotificationFeedbackType.Success );
        navigation.goBack();
    };

  // Build a tiny SVG preview for the selected value of a characteristic
  const getPreview = (key, size = 22) => {
    switch (key) {
      case 'hair':
        return (
          <Svg width={size} height={size} viewBox="0 0 64 64">
            <Hair value={internalCharacters.hair} color="#111827" />
          </Svg>
        );
      case 'eyes':
        return (
          <Svg width={size} height={size} viewBox="0 0 64 64">
            <Eyes value={internalCharacters.eyes} />
          </Svg>
        );
      case 'body':
        return (
          <Svg width={size} height={size} viewBox="0 0 64 64">
            <Body value={internalCharacters.body} color="#111827" />
          </Svg>
        );
      case 'mouth':
        return (
          <Svg width={size} height={size} viewBox="0 0 64 64">
            <Mouth value={internalCharacters.mouth} />
          </Svg>
        );
      case 'facialHair':
        return (
          <Svg width={size} height={size} viewBox="0 0 64 64">
            <FacialHair value={internalCharacters.facialHair} color="#111827" />
          </Svg>
        );
      case 'nose':
        return (
          <Svg width={size} height={size} viewBox="0 0 64 64">
            <Nose value={internalCharacters.nose} color="#111827" />
          </Svg>
        );
      default:
        return null;
    }
  };

  const renderButton = (key) => {
    const cfg = CONFIG[key];
    if (!cfg) return null;
    const valueText = cfg.valueKey ? internalCharacters[cfg.valueKey] : null;
    const colorKeyValue = cfg.colorKey ? internalCharacters[cfg.colorKey] : null;
    const colorMap = cfg.colors || {};
    const colorPreview = colorKeyValue ? colorMap[colorKeyValue] : 'transparent';
    const preview = getPreview(key,50);

    return (
        <BouncyAppear
        style={{
          width: '48%',
        //   aspectRatio: 2,
          padding: 8,
          gap : 3,
          borderRadius: 16,
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#E5E7EB',
          marginBottom: 12,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',

          ...(Platform.OS === 'ios'
            ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }
            : { elevation: 2 }),
        }}

        pressable={true}
        onPress={() => openModal(key)}

        key={key} initialScale={.1}  delay={ 100 + characteristicOrder.indexOf(key) * 30}>
      
        {!!valueText && preview ? (
            <View
              style={{
                // paddingHorizontal: 10,
                // paddingVertical: 6,
                backgroundColor: '#f0f0f0ff',
                borderRadius: 999,
               // marginRight: 10,
               // borderWidth: 1,
                //borderColor: '#111827',
              }}
            >
              {preview}
            </View>
          )
          :
          
          cfg.colorKey && (
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                backgroundColor: colorPreview || '#F3F4F6',
                borderWidth: 2,
                borderColor: '#ffffffff',
                marginBottom : 10,
              }}
            />
            
          )
          }
        <Text style={{ fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#111827' }}>{cfg.label}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      
        </View>
      </BouncyAppear>
    );
  };

  const activeCfg = activeKey ? CONFIG[activeKey] : null;

  // Color grid for modal
  const renderColorGrid = () => {
    if (!activeCfg || !activeCfg.colors || !activeCfg.colorKey) return null;
    const selectedColorKey = internalCharacters[activeCfg.colorKey];
    const entries = Object.entries(activeCfg.colors);
    const gap = 10;
    const perRow = 6;
    const horizontalPadding = 16; // matches modal container padding
    const gridWidth = windowWidth - horizontalPadding * 2;
    const boxSize = Math.floor((gridWidth - gap * (perRow - 1)) / perRow);

    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#6B7280', marginBottom: 8 }}>Couleurs</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {entries.map(([k, col], idx) => {
            const selected = k === selectedColorKey;
            return (
                <BouncyAppear onPress={() => selectColor(activeKey, k)} key={k} initialScale={0} delay={100 + idx * 30} pressable={true}
                style={{
                  width: boxSize,
                  height: boxSize,
                  borderRadius: 10,
                  backgroundColor: '#f4f4f4ff',
                  marginRight: (idx +2) % perRow === 0 ? 0 : gap,
                  marginBottom: gap,
                  borderWidth: 2,
                  borderColor: '#E5E7EB',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                >
             
                <View
                  style={{
                    width: boxSize - 12,
                    height: boxSize - 12,
                    borderRadius: 8,
                    backgroundColor: col,
                    // borderWidth: selected ? 2 : 0,
                    // borderColor: selected ? '#111827' : 'transparent',
                  }}
                />
                {selected &&
                    <Entypo name="check" size={24} color="#ffffffff" style={{ position: 'absolute'}} />
                }
              </BouncyAppear>
            );
          })}
        </View>
      </View>
    );
  };

  // Value switcher with arrows
  const renderValueSwitcher = () => {
    if (!activeCfg) return null;
    if (!activeCfg.values || !activeCfg.valueKey) {
      // Only color (e.g., Skin)
      return null;
    }
    const current = internalCharacters[activeCfg.valueKey];
    return (
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#6B7280', marginBottom: 8 }}>Forme</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BouncyAppear pressScale={1.2} pressable={true} onPress={() => cycleValue(activeKey, -1)} style={{ padding: 10 }}>
            <Ionicons name="chevron-back" size={30} color="#111827" />
          </BouncyAppear>
          <View style={{  backgroundColor: '#ffffffff', borderRadius : 200, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 0 }}}>
            {getPreview(activeKey, 100)}
          </View>
          <BouncyAppear pressable={true} pressScale={1.2} onPress={() => cycleValue(activeKey, 1)} style={{ padding: 10 }}>
            <Ionicons name="chevron-forward" size={30} color="#111827" />
          </BouncyAppear>
        </View>
      </View>
    );
  };

const insets = useSafeAreaInsets();
  

  return (
    <View style={{ flex: 1, paddingTop: 24 }}>
      <View style={{ alignItems: 'center', marginBottom: 16,marginTop : insets.top }}>
        <BouncyAppear initialScale={0} delay={50} pressable={true} >
          <View style={{ width: 260, height: 260 }}>
            { internalCharacters ? <PersonasAvatar
              ref={avatarRef}
              characters={combineCharacters(internalCharacters)}
              onNewCharacters={(chars) => setCharacters(parseCharacters(chars))}
              style={{ width: '100%', height: '100%' }}
            /> : 
            
            <View style={{ width: '100%', height: '100%', backgroundColor : '#dededeff', borderRadius : 999}} />
            
            }
            <Sparkles  ref={sparklesRef} />
          </View>
        </BouncyAppear>
      </View>

      {internalCharacters && <ScrollView contentContainerStyle={{ marginHorizontal : "5%", flexGrow : 2 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {characteristicOrder.map((key) => renderButton(key))}
        </View>
      </ScrollView>}


{internalCharacters &&
  <BouncyAppear pressable={true}
    onPress={saveAvatarButton}
            activeOpacity={0.8}
            
          >
            
                <LinearGradient
              colors={['#f9b16e', '#f68080']}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
            style={{
              marginBottom : insets.bottom,
                marginHorizontal : "5%",

              paddingVertical: 12,
              borderRadius: 14,
              alignItems: 'center',
            }}
            
            >
            <Text style={{ color: 'white', fontFamily: 'Inter-Black', fontSize: 18 }}>Terminé !</Text>
            </LinearGradient>
            
      
          </BouncyAppear>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <Pressable onPress={closeModal} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.0)' }} />
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor : '#ffffffff',
            
            borderRadius :getDeviceCornerRadius(),
            borderWidth: 1,
            borderColor: '#E5E7EB',
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
            padding: 16,
            paddingBottom: 24,
            margin : 10
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' }} />
          </View>
          <Text style={{ fontSize: 18, fontFamily: 'Inter-Black', color: '#111827', marginBottom: 12 }}>
            {activeCfg ? activeCfg.label : ''}
          </Text>
          {renderColorGrid()}
          {renderValueSwitcher()}

          <BouncyAppear pressable={true}
            onPress={closeModal}
            activeOpacity={0.8}
            style={{
              marginTop: 18,
              backgroundColor: '#111827',
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontFamily: 'Inter-SemiBold', fontSize: 16 }}>Choisir</Text>
          </BouncyAppear>
        </View>
      </Modal>
    </View>
  );
};

export default AvatarCreationView;