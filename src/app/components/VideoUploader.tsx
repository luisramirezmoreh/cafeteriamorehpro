import { useState, useRef } from 'react';
import { Upload, Video, Trash2, Play, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface VideoUploaderProps {
  onVideoUpdate: (videoUrl: string | null) => void;
  currentVideoUrl: string | null;
}

export function VideoUploader({ onVideoUpdate, currentVideoUrl }: VideoUploaderProps) {
  const [videoPreview, setVideoPreview] = useState<string | null>(currentVideoUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validar que sea un video
    if (!file.type.startsWith('video/')) {
      toast.error('Por favor selecciona un archivo de video válido');
      return;
    }

    // Validar tamaño (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error('El video es demasiado grande. Máximo 100MB');
      return;
    }

    // Si Supabase está configurado, subir el archivo
    if (isSupabaseConfigured()) {
      setIsUploading(true);
      
      try {
        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const fileName = `screensaver-${timestamp}.${file.name.split('.').pop()}`;
        
        // Subir archivo a Supabase Storage
        const { data, error } = await supabase.storage
          .from('cafeteria-videos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Obtener URL pública del video
        const { data: urlData } = supabase.storage
          .from('cafeteria-videos')
          .getPublicUrl(fileName);

        const videoUrl = urlData.publicUrl;
        setVideoPreview(videoUrl);
        onVideoUpdate(videoUrl);
        
        toast.success('Video subido exitosamente a Supabase');
      } catch (error) {
        console.error('Error al subir video:', error);
        toast.error('Error al subir el video a Supabase');
      } finally {
        setIsUploading(false);
      }
    } else {
      // Fallback: usar URL local (no persistente)
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
      onVideoUpdate(videoUrl);
      
      toast.warning('Video cargado localmente (no persistente). Configura Supabase para almacenamiento permanente.');
    }
  };

  const handleRemoveVideo = async () => {
    if (videoPreview) {
      // Si es un video de Supabase, intentar eliminarlo
      if (isSupabaseConfigured() && videoPreview.includes('supabase.co')) {
        try {
          // Extraer nombre del archivo de la URL
          const fileName = videoPreview.split('/').pop();
          if (fileName) {
            await supabase.storage
              .from('cafeteria-videos')
              .remove([fileName]);
          }
        } catch (error) {
          console.error('Error al eliminar video de Supabase:', error);
        }
      } else {
        // Si es URL local, revocarla
        URL.revokeObjectURL(videoPreview);
      }
    }
    
    setVideoPreview(null);
    onVideoUpdate(null);
    setIsPlaying(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast.info('Video eliminado');
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Video className="w-6 h-6 text-purple-600" />
        <div>
          <h3 className="text-lg font-bold">Video de Pantalla de Inicio</h3>
          <p className="text-sm text-gray-600">
            Sube un video personalizado para mostrar cuando no se está usando la tablet
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Información */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Recomendaciones:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Formato: MP4, WebM o MOV</li>
                <li>Tamaño máximo: 100MB</li>
                <li>Resolución recomendada: 1920x1080 (Full HD)</li>
                <li>El video se reproducirá en bucle automáticamente</li>
                {isSupabaseConfigured() && (
                  <li className="text-green-700 font-semibold">✅ Supabase configurado - Videos permanentes</li>
                )}
                {!isSupabaseConfigured() && (
                  <li className="text-amber-700 font-semibold">⚠️ Supabase no configurado - Videos temporales</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Preview del video */}
        {videoPreview ? (
          <div className="space-y-3">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoPreview}
                className="w-full h-64 object-contain"
                loop
                onEnded={() => setIsPlaying(false)}
              />
              
              {/* Controles de reproducción */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-30 transition-all">
                <Button
                  onClick={handlePlayPause}
                  size="lg"
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 rounded-full w-16 h-16 p-0"
                >
                  {isPlaying ? (
                    <span className="text-2xl">⏸</span>
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </Button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1"
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Subiendo...' : 'Reemplazar Video'}
              </Button>
              <Button
                onClick={handleRemoveVideo}
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isUploading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Video
              </Button>
            </div>
          </div>
        ) : (
          /* Zona de carga */
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed border-gray-300 rounded-lg p-12 text-center ${
              isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-purple-500 hover:bg-purple-50'
            } transition-all`}
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {isUploading ? 'Subiendo video...' : 'Haz clic para seleccionar un video'}
            </p>
            <p className="text-sm text-gray-500">
              {isUploading ? 'Por favor espera...' : 'o arrastra y suelta aquí'}
            </p>
          </div>
        )}

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    </Card>
  );
}