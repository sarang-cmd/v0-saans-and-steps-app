'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FamilyMember, FamilyCheckIn } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FamilyFeaturesProps {
  familyMembers: FamilyMember[];
  entitlementLevel: string;
  onAddMember: (name: string, relation: string) => void;
  onRemoveMember: (memberId: string) => void;
}

export const FamilyFeatures: React.FC<FamilyFeaturesProps> = ({
  familyMembers,
  entitlementLevel,
  onAddMember,
  onRemoveMember,
}) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRelation, setMemberRelation] = useState('family');
  const [showQRCode, setShowQRCode] = useState(false);
  const [shareCode] = useState(generateShareCode());

  const canAddMembers = entitlementLevel === 'pro' || entitlementLevel === 'max';
  const memberLimit = entitlementLevel === 'pro' ? 5 : entitlementLevel === 'max' ? 10 : 0;

  const handleAddMember = () => {
    if (memberName.trim()) {
      onAddMember(memberName, memberRelation);
      setMemberName('');
      setMemberRelation('family');
      setShowAddMember(false);
    }
  };

  if (!canAddMembers) {
    return (
      <Card className="border-secondary/20 bg-secondary/5">
        <CardHeader>
          <CardTitle>Family Features</CardTitle>
          <CardDescription>Share health data with family members</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground/70 mb-4">
            Family sharing is available in Pro and Max plans. Upgrade to share your air quality and workout data with family members.
          </p>
          <Button asChild>
            <a href="/#upgrade">Upgrade to Pro</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Family Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Family Members</CardTitle>
              <CardDescription>
                {familyMembers.length} of {memberLimit} family members added
              </CardDescription>
            </div>
            {familyMembers.length < memberLimit && (
              <Button
                size="sm"
                onClick={() => setShowAddMember(!showAddMember)}
              >
                + Add Member
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {showAddMember && (
            <div className="p-4 border border-border rounded-lg space-y-3 mb-4">
              <input
                type="text"
                placeholder="Family member name"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground"
              />

              <select
                value={memberRelation}
                onChange={(e) => setMemberRelation(e.target.value)}
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground"
              >
                <option value="family">Family Member</option>
                <option value="friend">Friend</option>
                <option value="coach">Coach</option>
                <option value="doctor">Doctor</option>
              </select>

              <div className="flex gap-2">
                <Button onClick={handleAddMember} className="flex-1">
                  Add Member
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddMember(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {familyMembers.length === 0 ? (
            <p className="text-sm text-foreground/60 text-center py-6">
              No family members added yet. Invite someone to share your health data.
            </p>
          ) : (
            familyMembers.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-lg border border-border flex items-center justify-between bg-card/50 hover:bg-card transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-foreground/60 capitalize">{member.relation}</p>
                </div>
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="px-3 py-1 rounded text-destructive hover:bg-destructive/10 transition-colors text-sm"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Invite via QR Code or Share Code */}
      <Card>
        <CardHeader>
          <CardTitle>Share via QR Code</CardTitle>
          <CardDescription>Family members can scan to join</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-foreground/70">
            Your share code: <span className="font-mono font-bold text-foreground">{shareCode}</span>
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowQRCode(!showQRCode)}
          >
            {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
          </Button>

          {showQRCode && (
            <div className="p-4 bg-card/50 rounded-lg border border-border flex flex-col items-center">
              <div className="bg-white p-4 rounded">
                {/* Placeholder for QR code - in production would use qrcode.react or similar */}
                <div className="w-40 h-40 bg-gray-100 flex items-center justify-center rounded">
                  <p className="text-center text-xs text-gray-500">
                    QR Code
                    <br />
                    {shareCode}
                  </p>
                </div>
              </div>
              <p className="text-xs text-foreground/60 mt-3 text-center">
                Share this code: <span className="font-mono font-bold">{shareCode}</span>
              </p>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              navigator.clipboard.writeText(shareCode);
              alert('Share code copied to clipboard!');
            }}
          >
            Copy Share Code
          </Button>
        </CardContent>
      </Card>

      {/* Family Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle>Family Check-ins</CardTitle>
          <CardDescription>Monitor where family members are exercising</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {familyMembers.length === 0 ? (
              <p className="text-sm text-foreground/60 text-center py-6">
                Add family members to enable check-ins
              </p>
            ) : (
              familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-lg border border-border bg-card/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-foreground/60">
                        Last check-in: <span className="text-foreground/70">Never</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                        No data yet
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Button variant="outline" className="w-full mt-4" disabled>
            View Family Map (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-border/50 bg-foreground/2">
        <CardContent className="pt-6">
          <p className="text-xs text-foreground/70">
            Privacy Note: Family members can only see your location during workouts when you enable check-ins.
            All data is encrypted and stored securely.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
