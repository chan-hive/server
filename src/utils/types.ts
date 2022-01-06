/* eslint-disable @typescript-eslint/no-namespace */
export namespace API {
    export namespace Boards {
        export interface Result {
            boards: Board[];
        }

        export interface Board {
            board: string;
            title: string;
            ws_board: number;
            per_page: number;
            pages: number;
            max_filesize: number;
            max_webm_filesize: number;
            max_comment_chars: number;
            max_webm_duration: number;
            bump_limit: number;
            image_limit: number;
            cooldowns: Cooldowns;
            meta_description: string;
            is_archived?: number;
            spoilers?: number;
            custom_spoilers?: number;
            forced_anon?: number;
            user_ids?: number;
            country_flags?: number;
            code_tags?: number;
            webm_audio?: number;
            min_image_width?: number;
            min_image_height?: number;
            oekaki?: number;
            sjis_tags?: number;
            board_flags?: BoardFlags;
            text_only?: number;
            require_subject?: number;
            math_tags?: number;
        }

        export interface Cooldowns {
            threads: number;
            replies: number;
            images: number;
        }

        export interface BoardFlags {
            AC?: string;
            AN: string;
            BL?: string;
            CF?: string;
            CM?: string;
            CT?: string;
            DM?: string;
            EU?: string;
            FC?: string;
            GN?: string;
            GY?: string;
            JH?: string;
            KN?: string;
            MF?: string;
            NB?: string;
            NZ?: string;
            PC: string;
            PR?: string;
            RE?: string;
            TM?: string;
            TR?: string;
            UN?: string;
            WP?: string;
            "4CC"?: string;
            ADA?: string;
            ANF?: string;
            APB?: string;
            AJ?: string;
            AB?: string;
            AU?: string;
            BB?: string;
            BM?: string;
            BP?: string;
            BS?: string;
            CL?: string;
            CO?: string;
            CG?: string;
            CHE?: string;
            CB?: string;
            DAY?: string;
            DD?: string;
            DER?: string;
            DT?: string;
            DIS?: string;
            EQA?: string;
            EQF?: string;
            EQP?: string;
            EQR?: string;
            EQT?: string;
            EQI?: string;
            EQS?: string;
            ERA?: string;
            FAU?: string;
            FLE?: string;
            FL?: string;
            GI?: string;
            IZ?: string;
            LI?: string;
            LT?: string;
            LY?: string;
            MA?: string;
            MAU?: string;
            MIN?: string;
            NI?: string;
            NUR?: string;
            OCT?: string;
            PAR?: string;
            PCE?: string;
            PI?: string;
            PLU?: string;
            PM?: string;
            PP?: string;
            QC?: string;
            RAR?: string;
            RD?: string;
            RLU?: string;
            S1L?: string;
            SCO?: string;
            SHI?: string;
            SIL?: string;
            SON?: string;
            SP?: string;
            SPI?: string;
            SS?: string;
            STA?: string;
            STL?: string;
            SUN?: string;
            SUS?: string;
            SWB?: string;
            TFA?: string;
            TFO?: string;
            TFP?: string;
            TFS?: string;
            TFT?: string;
            TFV?: string;
            TP?: string;
            TS?: string;
            TWI?: string;
            TX?: string;
            VS?: string;
            ZE?: string;
        }
    }
}
