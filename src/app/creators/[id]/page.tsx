"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Instagram,
  Globe,
  Users,
  Camera,
  Handshake,
  Calendar,
  ExternalLink,
  Film,
  Image,
  Play,
  UtensilsCrossed,
} from "lucide-react";
import { FOLLOWER_RANGE_LABELS, formatDate } from "@/lib/utils";

interface CreatorProfile {
  user: {
    id: string;
    nameDisplay: string;
    createdAt: string;
  };
  profile: {
    city: string;
    instagramUrl: string;
    tiktokUrl: string | null;
    portfolioUrl: string | null;
    followerRange: string;
    niches: string[];
    languages: string[];
    strikesCount: number;
  };
  stats: {
    completedCollabs: number;
    contentSubmitted: number;
  };
  portfolio?: PortfolioItem[];
}

interface PortfolioItem {
  type: string;
  url: string;
  description: string | null;
  thumbnailUrl: string | null;
  campaignTitle: string;
  restaurantName: string;
  submittedAt: string;
}

export default function CreatorPublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/creators/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-lg mx-auto space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-xl w-32" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
          <div className="h-32 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Profil nie znaleziony</h2>
          <p className="text-sm text-gray-500 mb-4">Ten twórca nie istnieje lub nie ma publicznego profilu.</p>
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft size={16} className="mr-1" /> Wróć
          </Button>
        </div>
      </div>
    );
  }

  const { user, profile, stats } = data;
  const initial = user.nameDisplay.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 pb-16 pt-6 px-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Wróć
          </button>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-3xl font-bold shrink-0">
              {initial}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user.nameDisplay}</h1>
              <div className="flex items-center gap-2 mt-1 text-white/80 text-sm">
                <MapPin size={14} />
                <span>{profile.city}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-white/20 text-white border-0">
                  {FOLLOWER_RANGE_LABELS[profile.followerRange] || profile.followerRange} followersów
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content overlapping header */}
      <div className="max-w-lg mx-auto px-4 -mt-10 pb-8 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <Handshake size={18} className="text-orange-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{stats.completedCollabs}</p>
            <p className="text-xs text-gray-500">Kolaboracji</p>
          </Card>
          <Card className="p-4 text-center">
            <Camera size={18} className="text-orange-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{stats.contentSubmitted}</p>
            <p className="text-xs text-gray-500">Contentu</p>
          </Card>
          <Card className="p-4 text-center">
            <Calendar size={18} className="text-orange-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{formatDate(user.createdAt).split(" ").slice(1).join(" ")}</p>
            <p className="text-xs text-gray-500">Od</p>
          </Card>
        </div>

        {/* Social links */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Linki</h3>
          <div className="space-y-2">
            <a
              href={profile.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 transition-colors"
            >
              <Instagram size={18} className="text-pink-500" />
              <span className="text-sm font-medium text-gray-700 flex-1">Instagram</span>
              <ExternalLink size={14} className="text-gray-400" />
            </a>

            {profile.tiktokUrl && (
              <a
                href={profile.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-gray-800" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.84 2.84 0 0 1 .84.13v-3.5a6.38 6.38 0 0 0-.84-.05A6.33 6.33 0 0 0 3.16 15.3 6.33 6.33 0 0 0 9.49 21.63a6.33 6.33 0 0 0 6.33-6.33V8.86a8.18 8.18 0 0 0 3.77.97V6.69Z" />
                </svg>
                <span className="text-sm font-medium text-gray-700 flex-1">TikTok</span>
                <ExternalLink size={14} className="text-gray-400" />
              </a>
            )}

            {profile.portfolioUrl && (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <Globe size={18} className="text-blue-500" />
                <span className="text-sm font-medium text-gray-700 flex-1">Portfolio</span>
                <ExternalLink size={14} className="text-gray-400" />
              </a>
            )}
          </div>
        </Card>

        {/* Niches */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Nisze</h3>
          <div className="flex flex-wrap gap-2">
            {profile.niches.map((niche) => (
              <span
                key={niche}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200"
              >
                {niche}
              </span>
            ))}
          </div>
        </Card>

        {/* Languages */}
        {profile.languages && profile.languages.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Języki</h3>
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                >
                  {lang.toUpperCase()}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Portfolio */}
        {data.portfolio && data.portfolio.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Portfolio</h3>
              <span className="text-xs text-gray-400">{data.portfolio.length} {data.portfolio.length === 1 ? "materiał" : data.portfolio.length < 5 ? "materiały" : "materiałów"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {data.portfolio.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.description || item.campaignTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        {item.type === "IG_REEL" || item.type === "TIKTOK" ? (
                          <Film size={28} className="text-gray-400" />
                        ) : item.type === "IG_STORY" ? (
                          <Play size={28} className="text-gray-400" />
                        ) : (
                          <Image size={28} className="text-gray-400" />
                        )}
                      </div>
                    )}

                    {/* Type badge overlay */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-sm">
                        {item.type === "IG_REEL" ? "Reel" : item.type === "IG_STORY" ? "Story" : item.type === "TIKTOK" ? "TikTok" : item.type}
                      </span>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <ExternalLink size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  <div className="mt-1.5">
                    <p className="text-xs font-medium text-gray-900 line-clamp-1">
                      {item.description || item.campaignTitle}
                    </p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <UtensilsCrossed size={10} />
                      {item.restaurantName}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </Card>
        )}

        {/* Reliability */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-2">Wiarygodność</h3>
          {profile.strikesCount === 0 ? (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Bez zastrzeżeń — 0 strike&apos;ów
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-600 text-sm">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              {profile.strikesCount} strike{profile.strikesCount === 1 ? "" : profile.strikesCount < 5 ? "\'y" : "\'ów"}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
