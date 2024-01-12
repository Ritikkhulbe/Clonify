"use client";

import useSound from "use-sound";
import { useEffect, useState } from "react";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { RiLoopLeftFill,RiShuffleLine } from "react-icons/ri";

import { usePlayerSettings } from '@/providers/PlayerSettingsContext'
import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";


import LikeButton from "./LikeButton";
import MediaItem from "./MediaItem";
import Slider from "./Slider";


interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ 
  song, 
  songUrl
}) => {
  const { volume, setVolume, isOnLoop, setIsOnLoop, isOnShuffle, setIsOnShuffle } = usePlayerSettings();
  const player = usePlayer();
  const [isPlaying, setIsPlaying] = useState(false);

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;


  //new
  const supabaseClient = useSupabaseClient();
  const { user } = useUser();

  useEffect(() => {
    if(!user){
      return;
    }
    const fetchPreferences = async () => {
      const { data, error } = await supabaseClient
        .from('preferences')
        .select('volume, isOnLoop, isOnShuffle')
        .eq('user_id', user); 

      if (error) {
        return;
      }

      if (data && data.length > 0) {
        const preferences = data[0];
        setVolume(preferences.volume);
        setIsOnLoop(preferences.isOnLoop);
        setIsOnShuffle(preferences.isOnShuffle);
      }
    };

    fetchPreferences();
  }, [user]);

  // useEffect(() => {
  //   const updatePreferences = async () => {
  //     if (!user) {
  //       return;
  //     }

  //     try {
  //       // Update user preferences in the Supabase database whenever they change
  //       await supabaseClient
  //         .from('preferences')
  //         .upsert(
  //           [
  //             {
  //               user_id: user.id,
  //               volume,
  //               isOnLoop,
  //               isOnShuffle,
  //             },
  //           ],
  //           { onConflict: 'user_id' }
  //         );

  //       console.log('User preferences updated successfully.');
  //     } catch (error) {
  //       console.error('Error updating user preferences:', error.message);
  //     }
  //   };

  //   // Update user preferences when they change
  //   updatePreferences();
  // }, [user, volume, isOnLoop, isOnShuffle]);

  //new
  const onLoop = () => {
    if (!isOnLoop){
      setIsOnLoop(true);
    }else{
      setIsOnLoop(false);
    }
  }

  const onShuffle = () => {
    if (!isOnShuffle){
      setIsOnShuffle(true);
    }else{
      setIsOnShuffle(false);
    }
  }


  const onPlayNext = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const nextSong = player.ids[currentIndex + 1];

    if(isOnShuffle){
      const randomIndex = Math.floor(Math.random() * player.ids.length);
      return player.setId(player.ids[randomIndex])
    }
    if (!nextSong && isOnLoop) {
      return player.setId(player.ids[0]);
    }else if(!nextSong){
      pause();
      return;
    }

    player.setId(nextSong);
  }

  const onPlayPrevious = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const previousSong = player.ids[currentIndex - 1];

    if (!previousSong && isOnLoop) {
      return player.setId(player.ids[player.ids.length - 1]);
    }else if(!previousSong){
      return player.setId(player.ids[0]);
    }

    player.setId(previousSong);
  }

  const [play, { pause, sound }] = useSound(
    songUrl,
    { 
      volume: volume,
      onplay: () => setIsPlaying(true),
      onend: () => {
        setIsPlaying(false);
        onPlayNext();
      },
      onpause: () => setIsPlaying(false),
      format: ['mp3']
    }
  );

  useEffect(() => {
    sound?.play();
    
    return () => {
      sound?.unload();
    }
  }, [sound]);

  const handlePlay = () => {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  }

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  }

  return ( 
    <div className="flex md:grid-cols-3 h-full">
        <div className="flex w-full justify-start">
          <div className="flex items-center gap-x-4 mr-3">
            <MediaItem data={song} />
            <LikeButton songId={song.id} />
          </div>
        </div>

        <div 
          className="
            flex 
            md:hidden 
            col-auto 
            w-full 
            justify-end 
            items-center
          "
        >
          <div 
            onClick={handlePlay} 
            className="
              h-10
              w-10
              flex 
              items-center 
              justify-center 
              rounded-full 
              bg-white 
              p-1 
              cursor-pointer
            "
          >
            <Icon size={30} className="text-black" />
          </div>
        </div>

        <div 
          className="
            hidden
            h-full
            md:flex 
            justify-center 
            items-center 
            w-full 
            max-w-[722px] 
            gap-x-6
          "
        >
          {isOnShuffle ? (
          <RiShuffleLine 
          onClick={onShuffle}
          size={20} 
          className="
            text-green-500 
            cursor-pointer 
            hover:text-green-300
            transition
            " 
          />
          ) : (
            <RiShuffleLine 
            onClick={onShuffle}
            size={20} 
            className="
              text-neutral-400 
              cursor-pointer 
              hover:text-white 
              transition
            " 
          />
          )}
          <AiFillStepBackward
            onClick={onPlayPrevious}
            size={30} 
            className="
              text-neutral-400 
              cursor-pointer 
              hover:text-white 
              transition
            "
          />
          <div 
            onClick={handlePlay} 
            className="
              flex 
              items-center 
              justify-center
              h-10
              w-10 
              rounded-full 
              bg-white 
              p-1 
              cursor-pointer
            "
          >
            <Icon size={30} className="text-black" />
          </div>
          <AiFillStepForward
            onClick={onPlayNext}
            size={30} 
            className="
              text-neutral-400 
              cursor-pointer 
              hover:text-white 
              transition
            " 
          />

          {isOnLoop ? (
          <RiLoopLeftFill 
          onClick={onLoop}
          size={20} 
          className="
            text-green-500 
            cursor-pointer 
            hover:text-green-300
            transition
            " 
          />
          ) : (
            <RiLoopLeftFill 
            onClick={onLoop}
            size={20} 
            className="
              text-neutral-400 
              cursor-pointer 
              hover:text-white 
              transition
            " 
          />
          )}


        </div>

        <div className="hidden md:flex w-full justify-end pr-2">
          <div className="flex items-center gap-x-2 w-[120px]">
            <VolumeIcon 
              onClick={toggleMute} 
              className="cursor-pointer" 
              size={34} 
            />
            <Slider 
              value={volume} 
              onChange={(value) => setVolume(value)}
            />
          </div>
        </div>

      </div>
   );
}
 
export default PlayerContent;