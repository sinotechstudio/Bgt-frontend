import React, { useState } from 'react';
import { User, Phone, Check, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ImageUpload } from '../ui/ImageUpload';
import { User as UserType } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onSuccess: (updatedUser: UserType) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [name, setName] = useState(user.name);
  const [gamerTag, setGamerTag] = useState(user.gamerTag);
  const [phone, setPhone] = useState(user.phone || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [bgmiId, setBgmiId] = useState(user.inGameIds?.bgmi || '');
  const [valId, setValId] = useState(user.inGameIds?.valorant || '');
  const [ffId, setFfId] = useState(user.inGameIds?.freefire || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !gamerTag.trim()) {
      error('Name and GamerTag are required', 'Validation Error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.auth.updateProfile({
        name,
        gamerTag,
        phone,
        avatar: avatar || undefined,
        inGameIds: {
          bgmi: bgmiId,
          valorant: valId,
          freefire: ffId,
        },
      });

      success(res.message || 'Profile updated successfully!', 'Changes Saved');
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to update profile', 'Update Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Gamer Profile"
      description="Update your personal details, avatar, and in-game credentials"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="GamerTag / Handle"
            value={gamerTag}
            onChange={(e) => setGamerTag(e.target.value)}
            required
          />
        </div>

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<Phone className="w-4 h-4" />}
        />

        <div className="p-3.5 rounded-xl bg-[#0A0F1D] border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Game Specific In-Game IDs (For Room Verifications)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              label="BGMI Character ID"
              placeholder="512948190"
              value={bgmiId}
              onChange={(e) => setBgmiId(e.target.value)}
            />
            <Input
              label="Valorant Riot ID"
              placeholder="Viper#NA1"
              value={valId}
              onChange={(e) => setValId(e.target.value)}
            />
            <Input
              label="Free Fire UID"
              placeholder="982341029"
              value={ffId}
              onChange={(e) => setFfId(e.target.value)}
            />
          </div>
        </div>

        <ImageUpload
          label="Profile Avatar"
          currentImage={avatar}
          onImageSelected={(url) => setAvatar(url)}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            id="save-profile-btn"
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
