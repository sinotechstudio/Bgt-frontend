import React, { useState } from 'react';
import { Users, Shield, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ImageUpload } from '../ui/ImageUpload';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Team } from '../../types';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated?: (team: Team) => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onTeamCreated,
}) => {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tag.trim()) {
      error('Team Name and Tag are required', 'Form Validation');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.team.create({
        name,
        tag,
        description,
        logo: logo || undefined,
      });
      success(`Team "${res.data.name}" created successfully!`, 'Team Created');
      if (onTeamCreated) onTeamCreated(res.data);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to create team', 'Creation Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Esports Team"
      description="Assemble your competitive roster for squad tournaments"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Team Name"
          placeholder="e.g. Shadow Warriors"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Team Tag / Abbreviation"
          placeholder="e.g. SHDW (3-5 letters)"
          value={tag}
          onChange={(e) => setTag(e.target.value.toUpperCase())}
          maxLength={5}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Description
          </label>
          <textarea
            placeholder="Tell opponents and sponsors about your squad..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl bg-[#0E1526] border border-slate-700/80 px-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <ImageUpload
          label="Team Logo / Emblem"
          currentImage={logo}
          onImageSelected={(url) => setLogo(url)}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Team
          </Button>
        </div>
      </form>
    </Modal>
  );
};
